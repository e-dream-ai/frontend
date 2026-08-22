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

/** Whether a step of `delta` from `current` would actually move. */
export function canStep(
  current: number | null,
  delta: number,
  count: number,
): boolean {
  if (current === null) return false;
  const next = stepLightboxIndex(current, delta, count);
  return next !== null && next !== current;
}
