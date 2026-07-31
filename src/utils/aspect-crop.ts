/**
 * Pure helpers for the flow builder's aspect-ratio / crop feature (issue #668).
 *
 * A crop is stored as a normalized rectangle relative to the *source* image:
 *   { x, y, width, height } each in [0, 1].
 * The rectangle's pixel aspect ratio (width*srcW)/(height*srcH) is kept equal to
 * the flow's output aspect ratio by `defaultCenterCrop` / `clampCropRegion`.
 */

export type PresetRatio = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
export type AspectRatioSetting = "auto" | PresetRatio;

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

/** Preset label -> numeric ratio (width / height). Insertion order is the UI order. */
export const PRESET_RATIOS: Record<PresetRatio, number> = {
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "1:1": 1,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
};

/** Selector options, `auto` first. */
export const ASPECT_RATIO_OPTIONS: readonly AspectRatioSetting[] = [
  "auto",
  ...(Object.keys(PRESET_RATIOS) as PresetRatio[]),
];

/** Supported generation output buckets, label -> ratio. */
const SUPPORTED_SIZES: Record<string, number> = {
  "1280*720": 1280 / 720,
  "720*1280": 720 / 1280,
  "1280*1280": 1,
  "1024*768": 1024 / 768,
  "768*1024": 768 / 1024,
};

const DEFAULT_RATIO = 16 / 9;

export const aspectRatioFromDimensions = (
  width: number,
  height: number,
): number => width / height;

/** Snap arbitrary source dimensions to the closest preset ratio. */
export const nearestPresetRatio = (
  width: number,
  height: number,
): PresetRatio => {
  const ratio = aspectRatioFromDimensions(width, height);
  let best: PresetRatio = "16:9";
  let bestDist = Infinity;
  for (const key of Object.keys(PRESET_RATIOS) as PresetRatio[]) {
    const dist = Math.abs(PRESET_RATIOS[key] - ratio);
    if (dist < bestDist) {
      bestDist = dist;
      best = key;
    }
  }
  return best;
};

/**
 * Resolve an aspect-ratio setting to a numeric ratio. `auto` uses the fallback
 * dimensions (snapped to the nearest preset), or 16:9 when none are available.
 */
export const parseAspectRatio = (
  setting: AspectRatioSetting,
  fallback?: Dimensions,
): number => {
  if (setting !== "auto") return PRESET_RATIOS[setting];
  if (fallback && fallback.width > 0 && fallback.height > 0) {
    return PRESET_RATIOS[nearestPresetRatio(fallback.width, fallback.height)];
  }
  return DEFAULT_RATIO;
};

/**
 * The most common preset ratio across a set of image dimensions — the flow's
 * "auto" output shape. Frames matching it are left uncropped; only the odd ones
 * out get cropped. Ties break toward the earliest-appearing frame. Returns
 * undefined when no dimensions are known yet.
 */
export const majorityPresetRatio = (
  dims: Array<Dimensions | undefined>,
): PresetRatio | undefined => {
  const counts = new Map<PresetRatio, number>();
  const firstIdx = new Map<PresetRatio, number>();
  dims.forEach((d, i) => {
    if (!d || !d.width || !d.height) return;
    const p = nearestPresetRatio(d.width, d.height);
    counts.set(p, (counts.get(p) ?? 0) + 1);
    if (!firstIdx.has(p)) firstIdx.set(p, i);
  });
  let best: PresetRatio | undefined;
  let bestN = -1;
  let bestIdx = Infinity;
  for (const [p, n] of counts) {
    const idx = firstIdx.get(p)!;
    if (n > bestN || (n === bestN && idx < bestIdx)) {
      best = p;
      bestN = n;
      bestIdx = idx;
    }
  }
  return best;
};

/**
 * Resolve the flow's numeric output ratio. An explicit preset wins; `auto`
 * derives from the majority of the keyframe dimensions (16:9 when unknown).
 */
export const resolveFlowRatio = (
  dims: Array<Dimensions | undefined>,
  setting: AspectRatioSetting,
): number => {
  if (setting !== "auto") return PRESET_RATIOS[setting];
  const majority = majorityPresetRatio(dims);
  return majority ? PRESET_RATIOS[majority] : DEFAULT_RATIO;
};

/**
 * Largest centered crop of `targetRatio` that fits inside a source image
 * (a "cover" crop of the output within the source).
 */
export const defaultCenterCrop = (
  srcW: number,
  srcH: number,
  targetRatio: number,
): CropRegion => {
  const srcRatio = srcW / srcH;
  if (srcRatio > targetRatio) {
    // Source is wider than target -> full height, narrower width.
    const width = targetRatio / srcRatio;
    return { x: (1 - width) / 2, y: 0, width, height: 1 };
  }
  // Source is taller/narrower than target -> full width, shorter height.
  const height = srcRatio / targetRatio;
  return { x: 0, y: (1 - height) / 2, width: 1, height };
};

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

/**
 * Force a region to satisfy the target aspect ratio and stay inside the source.
 * Width is treated as the primary hint; height is re-derived from it. If the
 * derived box is too tall it is shrunk to fit. The box center is preserved where
 * possible, then position is clamped so the box stays within [0, 1].
 */
export const clampCropRegion = (
  region: CropRegion,
  srcW: number,
  srcH: number,
  targetRatio: number,
): CropRegion => {
  const srcRatio = srcW / srcH;
  // height = width * srcRatio / targetRatio keeps (w*srcW)/(h*srcH) === targetRatio.
  let width = clamp01(region.width <= 0 ? 1 : region.width);
  let height = (width * srcRatio) / targetRatio;
  if (height > 1) {
    height = 1;
    width = (height * targetRatio) / srcRatio;
  }

  const cx = region.x + region.width / 2;
  const cy = region.y + region.height / 2;
  let x = cx - width / 2;
  let y = cy - height / 2;

  x = Math.min(1 - width, Math.max(0, x));
  y = Math.min(1 - height, Math.max(0, y));

  return { x, y, width, height };
};

export interface PixelRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/** Convert a normalized region into an integer source-pixel rect for canvas draw. */
export const cropRegionToPixels = (
  region: CropRegion,
  srcW: number,
  srcH: number,
): PixelRect => {
  const sx = Math.round(clamp01(region.x) * srcW);
  const sy = Math.round(clamp01(region.y) * srcH);
  const sw = Math.min(srcW - sx, Math.round(region.width * srcW));
  const sh = Math.min(srcH - sy, Math.round(region.height * srcH));
  return { sx, sy, sw, sh };
};

/** Nearest supported generation size bucket for a target ratio. */
export const sizeStringForRatio = (targetRatio: number): string => {
  let best = "1280*720";
  let bestDist = Infinity;
  for (const [label, ratio] of Object.entries(SUPPORTED_SIZES)) {
    const dist = Math.abs(ratio - targetRatio);
    if (dist < bestDist) {
      bestDist = dist;
      best = label;
    }
  }
  return best;
};

const round4 = (n: number): number => Math.round(n * 1e4) / 1e4;

/** Stable cache key for a cropped-and-reuploaded Dream. */
export const cropSignature = (
  sourceDreamUuid: string,
  region: CropRegion,
  targetRatio: number,
): string =>
  [
    sourceDreamUuid,
    round4(region.x),
    round4(region.y),
    round4(region.width),
    round4(region.height),
    round4(targetRatio),
  ].join(":");

/** True when a region covers the whole source (no real crop needed). */
export const isFullFrameCrop = (region: CropRegion, eps = 1e-3): boolean =>
  Math.abs(region.x) < eps &&
  Math.abs(region.y) < eps &&
  Math.abs(region.width - 1) < eps &&
  Math.abs(region.height - 1) < eps;
