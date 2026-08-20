import type {
  StudioAction,
  VideoModel,
  LoRAConfig,
} from "@/types/studio.types";
import type { FlowTransition } from "@/types/flow.types";
import { ACTION_PRESETS } from "@/components/pages/studio/constants/action-presets";
import { TRANSITION_PRESETS } from "@/components/pages/studio/constants/transition-presets";
import {
  PRESET_GROUPS,
  createActionsFromPreset,
  type PresetGroup,
  type PresetPack,
} from "@/components/pages/studio/constants/preset-packs";

const ALL_PRESET_PACKS: PresetPack[] = [
  ...ACTION_PRESETS,
  ...TRANSITION_PRESETS,
];

const PACKS_BY_NAME = ALL_PRESET_PACKS.reduce((index, pack) => {
  if (!index.has(pack.name)) index.set(pack.name, pack);
  return index;
}, new Map<string, PresetPack>());

export interface PresetGroupOption {
  id: PresetGroup;
  label: string;
  presets: PresetPack[];
}

export function getPresetGroups(model: VideoModel): PresetGroupOption[] {
  const groups: PresetGroupOption[] = PRESET_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    presets: [],
  }));
  const byId = new Map(groups.map((group) => [group.id, group]));
  for (const pack of ALL_PRESET_PACKS) {
    if (pack.model !== "all" && pack.model !== model) continue;
    byId.get(pack.group)?.presets.push(pack);
  }
  return groups;
}

/**
 * Resolve a PresetPack name to a single StudioAction (the first action in the pack).
 * Returns undefined if the preset name is empty or not found.
 */
export function resolvePresetAction(
  presetName: string,
): StudioAction | undefined {
  if (!presetName) return undefined;
  const pack = PACKS_BY_NAME.get(presetName);
  if (!pack) return undefined;
  return createActionsFromPreset(pack)[0];
}

interface GlobalSettings {
  globalPresetId: string;
  globalPrompt: string;
  globalNegativePrompt: string;
  globalDuration: number;
  globalModel: VideoModel;
  globalNumInferenceSteps: number;
  globalGuidance: number;
  globalSeed: number;
  globalLora: LoRAConfig[] | undefined;
}

interface EffectiveSettings {
  presetId: string;
  prompt: string;
  negativePrompt: string;
  duration: number;
  model: VideoModel;
  numInferenceSteps: number;
  guidance: number;
  seed: number;
  action: Pick<StudioAction, "prompt" | "highNoiseLoras" | "lowNoiseLoras">;
}

/**
 * Compute effective settings for a transition: override > global.
 * Resolves the preset to a concrete StudioAction for buildVideoAlgoParams.
 */
export function resolveEffectiveSettings(
  transition: FlowTransition,
  global: GlobalSettings,
): EffectiveSettings {
  const presetId = transition.presetOverride ?? global.globalPresetId;
  const prompt = transition.promptOverride ?? global.globalPrompt;
  const negativePrompt =
    transition.negativePromptOverride ?? global.globalNegativePrompt;
  const duration = transition.durationOverride ?? global.globalDuration;
  const model = transition.modelOverride ?? global.globalModel;
  const numInferenceSteps =
    transition.numInferenceStepsOverride ?? global.globalNumInferenceSteps;
  const guidance = transition.guidanceOverride ?? global.globalGuidance;
  const seed = transition.seedOverride ?? global.globalSeed;

  // Resolve LoRAs: per-transition override > global override > preset > none
  let action: Pick<StudioAction, "prompt" | "highNoiseLoras" | "lowNoiseLoras">;

  const explicitLora = transition.loraOverride ?? global.globalLora;
  if (explicitLora) {
    // Explicit LoRA override — look up matching preset action for lowNoiseLoras
    const presetAction = resolvePresetAction(presetId);
    const matchesPreset =
      presetAction?.highNoiseLoras?.[0]?.path === explicitLora[0]?.path;
    action = {
      prompt: prompt || presetAction?.prompt || "",
      highNoiseLoras: explicitLora,
      lowNoiseLoras: matchesPreset ? presetAction!.lowNoiseLoras ?? [] : [],
    };
  } else {
    const presetAction = resolvePresetAction(presetId);
    if (presetAction) {
      action = {
        prompt: prompt || presetAction.prompt,
        highNoiseLoras: presetAction.highNoiseLoras ?? [],
        lowNoiseLoras: presetAction.lowNoiseLoras ?? [],
      };
    } else {
      action = { prompt, highNoiseLoras: [], lowNoiseLoras: [] };
    }
  }

  return {
    presetId,
    prompt,
    negativePrompt,
    duration,
    model,
    numInferenceSteps,
    guidance,
    seed,
    action,
  };
}
