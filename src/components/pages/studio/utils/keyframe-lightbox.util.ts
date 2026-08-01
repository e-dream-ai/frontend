/**
 * Pure index math for the keyframe lightbox (#694).
 *
 * The lightbox navigates the real keyframes list with ←/→ arrows. Navigation
 * clamps at the ends (no wrap-around) — the arrows are disabled once you reach
 * the first or last keyframe. Index is a position into the real keyframes; the
 * synthetic loop frame is not clickable and is excluded by the caller.
 *
 * No React, no DOM — so the navigation logic can be unit-tested in isolation.
 */

/** Clamp an index into [0, count-1]; returns null when there is nothing to show. */
export function clampLightboxIndex(
  index: number,
  count: number,
): number | null {
  if (count <= 0) return null;
  if (index < 0) return 0;
  if (index > count - 1) return count - 1;
  return index;
}

/**
 * Step the current index by `delta`, clamped to the valid range.
 * Returns null when the lightbox is closed (`current === null`) or empty.
 */
export function stepLightboxIndex(
  current: number | null,
  delta: number,
  count: number,
): number | null {
  if (current === null) return null;
  return clampLightboxIndex(current + delta, count);
}

/** Whether a prev/next step of `delta` is available from `current`. */
export function canStep(
  current: number | null,
  delta: number,
  count: number,
): boolean {
  if (current === null || count <= 0) return false;
  const next = current + delta;
  return next >= 0 && next <= count - 1;
}
