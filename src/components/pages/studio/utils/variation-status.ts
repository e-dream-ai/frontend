// Pure helpers for deriving a transition's display/interaction state from its
// variation candidates. Multi-variant generation writes results into
// `transition.variations[]` without rolling the transition's own `status` up to
// "processed" (that only happens when the user picks one). These helpers let the
// gap, click handler, and action bar reflect the variations' aggregate state so
// completed variations are visible and reachable instead of stranded.
import type { FlowTransition, VariationCandidate } from "@/types/flow.types";

export function isVideoUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

export type VariationAggregate =
  | "none"
  | "queue"
  | "processing"
  | "ready"
  | "failed";

export function aggregateVariationStatus(
  variations?: VariationCandidate[],
): VariationAggregate {
  if (!variations || variations.length === 0) return "none";
  if (variations.some((v) => v.status === "processing")) return "processing";
  if (variations.some((v) => v.status === "queue")) return "queue";
  // No queued/processing left — terminal. Ready if at least one succeeded.
  if (variations.some((v) => v.status === "processed")) return "ready";
  return "failed";
}

export function aggregateVariationProgress(
  variations?: VariationCandidate[],
): number {
  if (!variations || variations.length === 0) return 0;
  const total = variations.reduce(
    (sum, v) => sum + (v.status === "processed" ? 100 : v.progress ?? 0),
    0,
  );
  return Math.round(total / variations.length);
}

// "review" = all variations finished and at least one succeeded, but the user
// hasn't selected one yet. The other values mirror TransitionStatus.
export type EffectiveTransitionStatus =
  | "idle"
  | "queue"
  | "processing"
  | "processed"
  | "failed"
  | "review";

export function effectiveTransitionStatus(
  t: FlowTransition,
): EffectiveTransitionStatus {
  // Single-variant path drives the transition's own status directly.
  if (t.status !== "idle") return t.status;
  // Idle transition that owns variations — derive from them.
  const agg = aggregateVariationStatus(t.variations);
  switch (agg) {
    case "none":
      return "idle";
    case "ready":
      return "review";
    default:
      return agg; // "queue" | "processing" | "failed"
  }
}

export function shouldOpenVariationLightbox(t: FlowTransition): boolean {
  if (t.status === "processed") return true;
  return !!(t.variations && t.variations.length > 0);
}

export function transitionHasUsableResult(t: FlowTransition): boolean {
  if (t.status === "processed") return true;
  return aggregateVariationStatus(t.variations) === "ready";
}
