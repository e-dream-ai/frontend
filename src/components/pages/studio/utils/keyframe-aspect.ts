import type { FlowKeyframe } from "@/types/flow.types";

/**
 * Two ratios count as equal when they differ by less than this fraction of the
 * larger one. Encoded sources round dimensions (1280x719 vs 1280x720, or a
 * model returning 1360x768 for "16:9"), and those are the same shape to a
 * viewer — only a genuine orientation or format change should read as an error.
 */
const RATIO_TOLERANCE = 0.02;

/**
 * Width/height of a keyframe's source image, or undefined until the <img> has
 * loaded and reported its natural size.
 */
export const aspectRatioOf = (kf?: FlowKeyframe): number | undefined => {
  const w = kf?.naturalWidth;
  const h = kf?.naturalHeight;
  return typeof w === "number" && typeof h === "number" && w > 0 && h > 0
    ? w / h
    : undefined;
};

/** True when two ratios are the same shape within RATIO_TOLERANCE. */
export const ratiosMatch = (a: number, b: number): boolean =>
  Math.abs(a - b) <= RATIO_TOLERANCE * Math.max(a, b);

/**
 * True when a transition joins two images of different shapes, which a video
 * model cannot render without distorting or cropping one end.
 *
 * Unknown dimensions are never a mismatch: a frame still loading, or one whose
 * image failed to load, must not be reported as an error. Each transition is
 * judged on its own two frames — there is no notion of a dominant flow ratio.
 */
export const isTransitionMismatched = (
  from?: FlowKeyframe,
  to?: FlowKeyframe,
): boolean => {
  const a = aspectRatioOf(from);
  const b = aspectRatioOf(to);
  if (a === undefined || b === undefined) return false;
  return !ratiosMatch(a, b);
};

/** Human-readable "1280x720" for tooltips, or undefined when not yet known. */
export const dimensionsLabel = (kf?: FlowKeyframe): string | undefined =>
  aspectRatioOf(kf) === undefined
    ? undefined
    : `${kf!.naturalWidth}x${kf!.naturalHeight}`;
