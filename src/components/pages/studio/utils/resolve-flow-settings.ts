import type {
  StudioAction,
  VideoModel,
  LoRAConfig,
} from "@/types/studio.types";
import type { FlowTransition } from "@/types/flow.types";
import {
  ACTION_PRESETS,
  createActionsFromPreset,
} from "@/components/pages/studio/constants/action-presets";

/**
 * Resolve a PresetPack name to a single StudioAction (the first action in the pack).
 * Returns undefined if the preset name is empty or not found.
 */
export function resolvePresetAction(
  presetName: string,
): StudioAction | undefined {
  if (!presetName) return undefined;
  const pack = ACTION_PRESETS.find((p) => p.name === presetName);
  if (!pack) return undefined;
  const actions = createActionsFromPreset(pack);
  return actions[0];
}

interface GlobalSettings {
  globalPresetId: string;
  globalPrompt: string;
  globalNegativePrompt: string;
  globalDuration: number;
  globalModel: VideoModel;
  globalNumInferenceSteps: number;
  globalGuidance: number;
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
    action,
  };
}
