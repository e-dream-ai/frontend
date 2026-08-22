import type { FlowTransition } from "@/types/flow.types";
import type { LoRAConfig, VideoModel } from "@/types/studio.types";

/**
 * The override keys the settings panel can write. Each one has a global
 * counterpart that applies when the transition carries no override.
 */
export type TransitionField =
  | "presetOverride"
  | "promptOverride"
  | "negativePromptOverride"
  | "durationOverride"
  | "modelOverride"
  | "numInferenceStepsOverride"
  | "guidanceOverride"
  | "seedOverride"
  | "loraOverride";

export interface TransitionGlobals {
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

/** Human-readable field names, used in the mismatch prompt. */
export const TRANSITION_FIELD_LABELS: Record<TransitionField, string> = {
  presetOverride: "Preset",
  promptOverride: "Prompt",
  negativePromptOverride: "Negative Prompt",
  durationOverride: "Duration",
  modelOverride: "Model",
  numInferenceStepsOverride: "Steps",
  guidanceOverride: "Guidance",
  seedOverride: "Seed",
  loraOverride: "LoRA",
};

const GLOBAL_KEY: Record<TransitionField, keyof TransitionGlobals> = {
  presetOverride: "globalPresetId",
  promptOverride: "globalPrompt",
  negativePromptOverride: "globalNegativePrompt",
  durationOverride: "globalDuration",
  modelOverride: "globalModel",
  numInferenceStepsOverride: "globalNumInferenceSteps",
  guidanceOverride: "globalGuidance",
  seedOverride: "globalSeed",
  loraOverride: "globalLora",
};

/**
 * Effective value of one field for one transition: override, else global.
 * `undefined` and a missing key are the same thing here — that is what "no
 * override" means — so `?? global` is the whole rule.
 */
export function effectiveFieldValue(
  transition: FlowTransition,
  globals: TransitionGlobals,
  field: TransitionField,
): unknown {
  return transition[field] ?? globals[GLOBAL_KEY[field]];
}

/**
 * Comparable form of a field value. LoRA is an array of objects, and only the
 * path identifies it to the picker, so it collapses to its paths; everything
 * else compares by value.
 */
export function fieldComparisonKey(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) {
    return (value as LoRAConfig[]).map((lora) => lora?.path ?? "").join("|");
  }
  return String(value);
}

/**
 * Do the given transitions currently disagree about this field? A selection of
 * one (or none) can never disagree.
 */
export function selectionHasMismatch(
  transitions: readonly FlowTransition[],
  globals: TransitionGlobals,
  field: TransitionField,
): boolean {
  if (transitions.length < 2) return false;
  const first = fieldComparisonKey(
    effectiveFieldValue(transitions[0], globals, field),
  );
  return transitions.some(
    (transition) =>
      fieldComparisonKey(effectiveFieldValue(transition, globals, field)) !==
      first,
  );
}

/** Every field the given transitions disagree about, in panel order. */
export function mismatchedFields(
  transitions: readonly FlowTransition[],
  globals: TransitionGlobals,
): TransitionField[] {
  return (Object.keys(TRANSITION_FIELD_LABELS) as TransitionField[]).filter(
    (field) => selectionHasMismatch(transitions, globals, field),
  );
}
