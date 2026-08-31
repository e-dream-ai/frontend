import type { FlowReferenceFrame, FlowTransition } from "@/types/flow.types";
import { isTransitionMismatched } from "./frame-aspect";
import { isTransitionStale } from "./transition-staleness";
import type { TransitionGlobals } from "./transition-field-values";

export interface GenerationTargets {
  targets: Array<{ index: number; transition: FlowTransition }>;
  skippedForMismatch: number;
  /** Of the targets: never rendered, and rendered-then-edited. */
  neverRendered: number;
  stale: number;
}

/**
 * What "Generate" runs when nothing is selected: everything whose video is not
 * what the current settings would produce. That is the never-rendered ones and
 * the ones edited since their render — a finished transition is only done while
 * its settings still match the take in the flow.
 *
 * In-flight work is left alone, and aspect-ratio mismatches are counted out
 * rather than run, since they would fail the same way they did before.
 */
export const resolveGenerationTargets = (
  transitions: readonly FlowTransition[],
  referenceFrames: readonly FlowReferenceFrame[],
  globals: TransitionGlobals,
): GenerationTargets => {
  const byId = new Map(referenceFrames.map((frame) => [frame.id, frame]));
  const targets: GenerationTargets["targets"] = [];
  let skippedForMismatch = 0;
  let neverRendered = 0;
  let stale = 0;

  transitions.forEach((transition, index) => {
    const { status, fromFrameId, toFrameId } = transition;
    if (status === "processing" || status === "queue") return;
    const isStale =
      status === "processed" && isTransitionStale(transition, globals);
    if (status === "processed" && !isStale) return;
    if (isTransitionMismatched(byId.get(fromFrameId), byId.get(toFrameId))) {
      skippedForMismatch += 1;
      return;
    }
    targets.push({ index, transition });
    if (isStale) stale += 1;
    else neverRendered += 1;
  });

  return { targets, skippedForMismatch, neverRendered, stale };
};

/**
 * What "Generate" runs against an explicit selection: all of it, rendered or
 * not, edited or not. Picking transitions and asking for a run is a request for
 * those transitions — staleness decides the default scope, never the chosen
 * one. Mismatched pairs are still counted out.
 */
export const resolveSelectedTargets = (
  indices: readonly number[],
  transitions: readonly FlowTransition[],
  referenceFrames: readonly FlowReferenceFrame[],
): Pick<GenerationTargets, "targets" | "skippedForMismatch"> => {
  const byId = new Map(referenceFrames.map((frame) => [frame.id, frame]));
  const targets: GenerationTargets["targets"] = [];
  let skippedForMismatch = 0;

  for (const index of indices) {
    const transition = transitions[index];
    if (!transition) continue;
    if (
      isTransitionMismatched(
        byId.get(transition.fromFrameId),
        byId.get(transition.toFrameId),
      )
    ) {
      skippedForMismatch += 1;
      continue;
    }
    targets.push({ index, transition });
  }

  return { targets, skippedForMismatch };
};
