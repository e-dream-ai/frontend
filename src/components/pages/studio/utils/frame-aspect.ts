import type { FlowReferenceFrame } from "@/types/flow.types";

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

const dimensionsOf = (frame?: FlowReferenceFrame): Dimensions | undefined => {
  const width = frame?.naturalWidth;
  const height = frame?.naturalHeight;
  if (typeof width !== "number" || typeof height !== "number") return undefined;
  if (width <= 0 || height <= 0) return undefined;
  return { width, height, ratio: width / height };
};

export const aspectRatioOf = (frame?: FlowReferenceFrame): number | undefined =>
  dimensionsOf(frame)?.ratio;

/** True when two ratios are the same shape within RATIO_TOLERANCE. */
export const ratiosMatch = (a: number, b: number): boolean =>
  Math.abs(a - b) <= RATIO_TOLERANCE * Math.max(a, b);

export const dimensionsLabel = (
  frame?: FlowReferenceFrame,
): string | undefined => {
  const d = dimensionsOf(frame);
  return d && `${d.width}x${d.height}`;
};

export const describeMismatch = (
  from?: FlowReferenceFrame,
  to?: FlowReferenceFrame,
): string | undefined => {
  const a = dimensionsOf(from);
  const b = dimensionsOf(to);
  if (!a || !b) return undefined;
  if (ratiosMatch(a.ratio, b.ratio)) return undefined;
  return `${a.width}x${a.height} to ${b.width}x${b.height}`;
};

export const isTransitionMismatched = (
  from?: FlowReferenceFrame,
  to?: FlowReferenceFrame,
): boolean => describeMismatch(from, to) !== undefined;
