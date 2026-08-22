import type { FlowReferenceFrame, FlowTransition } from "@/types/flow.types";
import { isTransitionMismatched } from "./frame-aspect";

export interface GenerationTargets {
  targets: Array<{ index: number; transition: FlowTransition }>;
  skippedForMismatch: number;
}

export const resolveGenerationTargets = (
  transitions: readonly FlowTransition[],
  referenceFrames: readonly FlowReferenceFrame[],
): GenerationTargets => {
  const byId = new Map(referenceFrames.map((frame) => [frame.id, frame]));
  const targets: GenerationTargets["targets"] = [];
  let skippedForMismatch = 0;

  transitions.forEach((transition, index) => {
    const { status, fromFrameId, toFrameId } = transition;
    if (status === "processed" || status === "processing" || status === "queue")
      return;
    if (isTransitionMismatched(byId.get(fromFrameId), byId.get(toFrameId))) {
      skippedForMismatch += 1;
      return;
    }
    targets.push({ index, transition });
  });

  return { targets, skippedForMismatch };
};
