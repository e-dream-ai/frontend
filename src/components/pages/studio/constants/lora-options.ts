import type {
  ActionLoraPick,
  LoRAConfig,
  StudioAction,
  VideoModel,
} from "@/types/studio.types";
import type { CameraMove } from "./preset-packs";
import { ACTION_PRESETS, ltxCameraLoraFile } from "./action-presets";

export interface LoraOption {
  /** LoRA path, used as the select value. Empty string means "no LoRA". */
  key: string;
  label: string;
  highNoiseLoras: readonly LoRAConfig[];
  lowNoiseLoras: readonly LoRAConfig[];
  cameraMove?: CameraMove;
}

export const NO_LORA_OPTION: LoraOption = {
  key: "",
  label: "No LoRA",
  highNoiseLoras: [],
  lowNoiseLoras: [],
};

const buildLoraOptionsForModel = (model: VideoModel): LoraOption[] => {
  const options: LoraOption[] = [];
  const seen = new Set<string>();

  for (const pack of ACTION_PRESETS) {
    if (pack.model !== model && pack.model !== "all") continue;
    for (const action of pack.actions) {
      const path = action.highNoiseLoras?.[0]?.path;
      if (!path || seen.has(path)) continue;
      seen.add(path);
      options.push({
        key: path,
        label: action.loraLabel ?? action.prompt.split(",")[0].trim(),
        highNoiseLoras: action.highNoiseLoras ?? [],
        lowNoiseLoras: action.lowNoiseLoras ?? [],
        cameraMove: action.cameraMove,
      });
    }
  }
  return options;
};

const OPTIONS_BY_MODEL = new Map<VideoModel, readonly LoraOption[]>();

export const getLoraOptionsForModel = (
  model: VideoModel,
): readonly LoraOption[] => {
  let options = OPTIONS_BY_MODEL.get(model);
  if (!options) {
    options = buildLoraOptionsForModel(model);
    OPTIONS_BY_MODEL.set(model, options);
  }
  return options;
};

/**
 * What a new action's LoRA menu starts on: the static camera where the model
 * has one (LTX), so a fresh action holds the shot instead of running with no
 * camera LoRA at all. Other models have only camera moves, and start on none.
 */
export const getDefaultLoraOption = (model: VideoModel): LoraOption =>
  getLoraOptionsForModel(model).find(
    (option) => option.key === ltxCameraLoraFile("static"),
  ) ?? NO_LORA_OPTION;

export const reconcileActionLoras = (
  actions: StudioAction[],
  model: VideoModel,
): StudioAction[] => {
  const validPaths = new Set(getLoraOptionsForModel(model).map((o) => o.key));
  let changed = false;

  const next = actions.map((action) => {
    const hasLoras =
      (action.highNoiseLoras?.length ?? 0) > 0 ||
      (action.lowNoiseLoras?.length ?? 0) > 0;
    if (!hasLoras) return action;

    const path = action.highNoiseLoras?.[0]?.path;
    if (path && validPaths.has(path)) return action;

    changed = true;
    return { ...action, highNoiseLoras: [], lowNoiseLoras: [] };
  });

  return changed ? next : actions;
};

const LORA_MODELS: readonly VideoModel[] = ["ltx-i2v", "wan-i2v"];

/** Whether the model takes LoRAs at all. Kling does not. */
export const modelSupportsLoras = (model: VideoModel) =>
  getLoraOptionsForModel(model).length > 0;

const findLora = (path: string | undefined) => {
  if (!path) return undefined;
  for (const model of LORA_MODELS) {
    const option = getLoraOptionsForModel(model).find((o) => o.key === path);
    if (option) return { model, option };
  }
  return undefined;
};

/**
 * Whether the action's LoRA can go to this model: not one known to be made
 * for another model, and not a model that takes no LoRAs. A path outside the
 * presets is the caller's own and passes through.
 */
export const actionLorasFitModel = (
  action: Pick<StudioAction, "highNoiseLoras">,
  model: VideoModel,
) => {
  if (!modelSupportsLoras(model)) return false;
  const known = findLora(action.highNoiseLoras?.[0]?.path);
  return !known || known.model === model;
};

const pickOf = (option: LoraOption): ActionLoraPick => ({
  highNoiseLoras: [...option.highNoiseLoras],
  lowNoiseLoras: [...option.lowNoiseLoras],
});

/**
 * Carries an action's LoRA across a model change. The same camera move on the
 * new model is used where there is one (LTX Dolly In to Wan Zoom In). Where
 * there is none (LTX Static, Wan Orbit) the action goes to no LoRA and keeps
 * the pick in `loraMemory`; a later switch that again finds no equivalent falls
 * back to what the action last had on that model. Moving to a model without LoRAs leaves
 * the action untouched; the LoRAs are simply not sent.
 */
export const retargetActionLoras = (
  action: StudioAction,
  model: VideoModel,
): StudioAction => {
  if (!modelSupportsLoras(model)) return action;

  const path = action.highNoiseLoras?.[0]?.path;
  const current = findLora(path);
  if (current?.model === model) return action;

  const options = getLoraOptionsForModel(model);
  const equivalent = current?.option.cameraMove
    ? options.find((o) => o.cameraMove === current.option.cameraMove)
    : undefined;

  const loraMemory = { ...action.loraMemory };
  if (current && !equivalent) {
    loraMemory[current.model] = pickOf(current.option);
  }

  let next: ActionLoraPick = { highNoiseLoras: [], lowNoiseLoras: [] };
  if (equivalent) {
    next = pickOf(equivalent);
  } else if (loraMemory[model]) {
    next = loraMemory[model]!;
  }
  // Whatever lands on this model is its live pick now, not a memory.
  delete loraMemory[model];

  return {
    ...action,
    ...next,
    loraMemory: Object.keys(loraMemory).length > 0 ? loraMemory : undefined,
  };
};

export const retargetActionsLoras = (
  actions: StudioAction[],
  model: VideoModel,
): StudioAction[] => {
  let changed = false;
  const next = actions.map((action) => {
    const retargeted = retargetActionLoras(action, model);
    if (retargeted !== action) changed = true;
    return retargeted;
  });
  return changed ? next : actions;
};
