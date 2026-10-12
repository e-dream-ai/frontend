export const UPSCALE_FACTOR_OPTIONS = [1, 2, 4] as const;
export const INTERPOLATION_FACTOR_OPTIONS = [1, 2, 4, 8] as const;

export type UpscaleFactor = (typeof UPSCALE_FACTOR_OPTIONS)[number];
export type InterpolationFactor = (typeof INTERPOLATION_FACTOR_OPTIONS)[number];

export const NO_OP_HINT =
  "1x on both upscale and interpolation would be a no-op — pick 1x on only one of them.";
