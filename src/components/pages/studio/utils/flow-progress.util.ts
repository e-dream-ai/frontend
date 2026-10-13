import type { FlowTransition } from "@/types/flow.types";

/**
 * Locate the transition currently carrying `dreamUuid`. Status updates from
 * socket events / the polling fallback resolve the target edge by UUID — not by
 * a captured array index — so inserting or reordering referenceFrames can never
 * misroute an update onto the wrong edge (#696). Returns -1 when no transition
 * owns the UUID.
 */
export function findTransitionIndexByDream(
  transitions: FlowTransition[],
  dreamUuid: string,
): number {
  return transitions.findIndex((t) => t.dreamUuid === dreamUuid);
}
