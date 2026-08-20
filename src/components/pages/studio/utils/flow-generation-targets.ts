import type { FlowKeyframe, FlowTransition } from "@/types/flow.types";
import { isTransitionMismatched } from "./keyframe-aspect";

export interface GenerationTargets {
  targets: Array<{ index: number; transition: FlowTransition }>;
  skippedForMismatch: number;
}

export const resolveGenerationTargets = (
  transitions: readonly FlowTransition[],
  keyframes: readonly FlowKeyframe[],
): GenerationTargets => {
  const byId = new Map(keyframes.map((kf) => [kf.id, kf]));
  const targets: GenerationTargets["targets"] = [];
  let skippedForMismatch = 0;

  transitions.forEach((transition, index) => {
    const { status, fromKeyframeId, toKeyframeId } = transition;
    if (status === "processed" || status === "processing" || status === "queue")
      return;
    if (
      isTransitionMismatched(byId.get(fromKeyframeId), byId.get(toKeyframeId))
    ) {
      skippedForMismatch += 1;
      return;
    }
    targets.push({ index, transition });
  });

  return { targets, skippedForMismatch };
};
