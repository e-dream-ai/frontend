import type { StudioAction, VideoModel } from "@/types/studio.types";
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
  globalDuration: number;
  globalModel: VideoModel;
  globalNumInferenceSteps: number;
  globalGuidance: number;
}

interface EffectiveSettings {
  presetId: string;
  prompt: string;
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
  const duration = transition.durationOverride ?? global.globalDuration;
  const model = transition.modelOverride ?? global.globalModel;
  const numInferenceSteps =
    transition.numInferenceStepsOverride ?? global.globalNumInferenceSteps;
  const guidance = transition.guidanceOverride ?? global.globalGuidance;

  // Resolve preset → StudioAction
  let action: Pick<StudioAction, "prompt" | "highNoiseLoras" | "lowNoiseLoras">;

  if (transition.loraOverride) {
    // Explicit LoRA override — use it directly
    action = {
      prompt,
      highNoiseLoras: transition.loraOverride,
      lowNoiseLoras: [],
    };
  } else {
    const presetAction = resolvePresetAction(presetId);
    if (presetAction) {
      // Use preset's LoRAs, but override prompt if specified
      action = {
        prompt,
        highNoiseLoras: presetAction.highNoiseLoras ?? [],
        lowNoiseLoras: presetAction.lowNoiseLoras ?? [],
      };
    } else {
      // No preset — bare prompt, no LoRAs
      action = { prompt, highNoiseLoras: [], lowNoiseLoras: [] };
    }
  }

  return {
    presetId,
    prompt,
    duration,
    model,
    numInferenceSteps,
    guidance,
    action,
  };
}
