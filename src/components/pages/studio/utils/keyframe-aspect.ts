import type { FlowKeyframe } from "@/types/flow.types";

/**
 * Two ratios count as equal when they differ by less than this fraction of the
 * larger one. Encoded sources round dimensions (1280x719 vs 1280x720, or a
 * model returning 1360x768 for "16:9"), and those are the same shape to a
 * viewer — only a genuine orientation or format change should read as an error.
 */
const RATIO_TOLERANCE = 0.02;

interface Dimensions {
  width: number;
  height: number;
  ratio: number;
}

const dimensionsOf = (kf?: FlowKeyframe): Dimensions | undefined => {
  const width = kf?.naturalWidth;
  const height = kf?.naturalHeight;
  if (typeof width !== "number" || typeof height !== "number") return undefined;
  if (width <= 0 || height <= 0) return undefined;
  return { width, height, ratio: width / height };
};

export const aspectRatioOf = (kf?: FlowKeyframe): number | undefined =>
  dimensionsOf(kf)?.ratio;

/** True when two ratios are the same shape within RATIO_TOLERANCE. */
export const ratiosMatch = (a: number, b: number): boolean =>
  Math.abs(a - b) <= RATIO_TOLERANCE * Math.max(a, b);

export const dimensionsLabel = (kf?: FlowKeyframe): string | undefined => {
  const d = dimensionsOf(kf);
  return d && `${d.width}x${d.height}`;
};

export const describeMismatch = (
  from?: FlowKeyframe,
  to?: FlowKeyframe,
): string | undefined => {
  const a = dimensionsOf(from);
  const b = dimensionsOf(to);
  if (!a || !b) return undefined;
  if (ratiosMatch(a.ratio, b.ratio)) return undefined;
  return `${a.width}x${a.height} to ${b.width}x${b.height}`;
};

export const isTransitionMismatched = (
  from?: FlowKeyframe,
  to?: FlowKeyframe,
): boolean => describeMismatch(from, to) !== undefined;
