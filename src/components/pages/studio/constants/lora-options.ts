import type {
  LoRAConfig,
  StudioAction,
  VideoModel,
} from "@/types/studio.types";
import { ACTION_PRESETS } from "./action-presets";

export interface LoraOption {
  /** LoRA path, used as the select value. Empty string means "no LoRA". */
  key: string;
  label: string;
  highNoiseLoras: readonly LoRAConfig[];
  lowNoiseLoras: readonly LoRAConfig[];
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
