import type { FlowTransition, TransitionRunSettings } from "@/types/flow.types";
import {
  resolveEffectiveSettings,
  type EffectiveSettings,
} from "./resolve-flow-settings";
import {
  fieldComparisonKey,
  type TransitionGlobals,
} from "./transition-field-values";

/**
 * The snapshot a run records, derived from the settings it resolved.
 *
 * Generation writes its snapshot through here and the staleness check below
 * reads through here, so "what this take was made from" and "what we would send
 * now" are produced by one piece of code. Two copies of this mapping would let
 * a field be recorded one way and compared another, and the difference would
 * show up as a transition that is permanently stale or never stale.
 */
export function runSettingsFromEffective(
  settings: EffectiveSettings,
): TransitionRunSettings {
  return {
    presetOverride: settings.presetId,
    promptOverride: settings.prompt,
    negativePromptOverride: settings.negativePrompt,
    durationOverride: settings.duration,
    modelOverride: settings.model,
    numInferenceStepsOverride: settings.numInferenceSteps,
    guidanceOverride: settings.guidance,
    seedOverride: settings.seed,
    loraOverride: settings.action.highNoiseLoras ?? [],
  };
}

/** What a run started for this transition right now would be recorded as. */
export function currentRunSettings(
  transition: FlowTransition,
  globals: TransitionGlobals,
): TransitionRunSettings {
  return runSettingsFromEffective(
    resolveEffectiveSettings(transition, globals),
  );
}

/** Two snapshots describing the same render. LoRA compares by path. */
export function runSettingsMatch(
  a: TransitionRunSettings,
  b: TransitionRunSettings,
): boolean {
  return (
    a.presetOverride === b.presetOverride &&
    a.promptOverride === b.promptOverride &&
    a.negativePromptOverride === b.negativePromptOverride &&
    a.durationOverride === b.durationOverride &&
    a.modelOverride === b.modelOverride &&
    a.numInferenceStepsOverride === b.numInferenceStepsOverride &&
    a.guidanceOverride === b.guidanceOverride &&
    a.seedOverride === b.seedOverride &&
    fieldComparisonKey(a.loraOverride) === fieldComparisonKey(b.loraOverride)
  );
}

/**
 * Has this transition been edited since the take now in the flow was made?
 *
 * Only a rendered transition can be stale: everything else is already visible
 * as its status. The comparison is against the run that produced the video on
 * screen — not the newest run — so restoring an older take reads as current,
 * which it is.
 *
 * A take with no recorded settings (persisted before runs carried a snapshot)
 * is treated as current. There is nothing to compare it against, and guessing
 * "stale" would mark every old flow for regeneration on sight.
 */
export function isTransitionStale(
  transition: FlowTransition,
  globals: TransitionGlobals,
): boolean {
  if (transition.status !== "processed" || !transition.dreamUuid) return false;
  const entry = transition.history?.find(
    (run) => run.dreamUuid === transition.dreamUuid,
  );
  if (!entry?.settings) return false;
  return !runSettingsMatch(
    currentRunSettings(transition, globals),
    entry.settings,
  );
}
