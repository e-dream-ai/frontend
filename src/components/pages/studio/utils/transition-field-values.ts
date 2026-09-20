import type { FlowTransition, TransitionSettings } from "@/types/flow.types";
import type { LoRAConfig } from "@/types/studio.types";

/**
 * The fields the settings panel can write. Every one is a plain value on
 * `transition.settings` — there is no global counterpart and nothing to
 * resolve, so comparing two transitions is comparing two objects.
 */
export type TransitionField = keyof TransitionSettings;

const TRANSITION_FIELD_LABELS: Record<TransitionField, string> = {
  prompt: "Prompt",
  negativePrompt: "Negative Prompt",
  duration: "Duration",
  model: "Model",
  steps: "Steps",
  guidance: "Guidance",
  seed: "Seed",
  highNoiseLoras: "LoRA",
  lowNoiseLoras: "LoRA",
};

const FIELD_ORDER = Object.keys(TRANSITION_FIELD_LABELS) as TransitionField[];

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
  field: TransitionField,
): boolean {
  if (transitions.length < 2) return false;
  const first = fieldComparisonKey(transitions[0].settings[field]);
  return transitions.some(
    (transition) => fieldComparisonKey(transition.settings[field]) !== first,
  );
}

/**
 * The patch that forces `fields` onto another transition: the source's value
 * for each. Only the fields that actually clash belong here — rewriting a field
 * the selection already agrees about would be a no-op that still counts as an
 * edit, which the staleness dot would report.
 */
export function forcedFieldPatch(
  source: FlowTransition,
  fields: readonly TransitionField[],
): Partial<TransitionSettings> {
  const patch: Record<string, unknown> = {};
  for (const field of fields) patch[field] = source.settings[field];
  return patch as Partial<TransitionSettings>;
}

/** Every field the given transitions disagree about, in panel order. */
export function mismatchedFields(
  transitions: readonly FlowTransition[],
): TransitionField[] {
  return FIELD_ORDER.filter((field) =>
    selectionHasMismatch(transitions, field),
  );
}
