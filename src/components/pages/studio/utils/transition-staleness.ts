import type { FlowTransition, TransitionSettings } from "@/types/flow.types";
import { fieldComparisonKey } from "./transition-field-values";

/** Two settings snapshots describing the same render. LoRA compares by path. */
export function settingsMatch(
  a: TransitionSettings,
  b: TransitionSettings,
): boolean {
  return (
    a.prompt === b.prompt &&
    a.negativePrompt === b.negativePrompt &&
    a.duration === b.duration &&
    a.model === b.model &&
    a.steps === b.steps &&
    a.guidance === b.guidance &&
    a.seed === b.seed &&
    fieldComparisonKey(a.highNoiseLoras) ===
      fieldComparisonKey(b.highNoiseLoras) &&
    fieldComparisonKey(a.lowNoiseLoras) === fieldComparisonKey(b.lowNoiseLoras)
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
export function isTransitionStale(transition: FlowTransition): boolean {
  if (transition.status !== "processed" || !transition.dreamUuid) return false;
  const entry = transition.history?.find(
    (run) => run.dreamUuid === transition.dreamUuid,
  );
  if (!entry?.settings) return false;
  return !settingsMatch(transition.settings, entry.settings);
}
