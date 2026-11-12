/** Krea 2 Turbo Style's style_scale on fal runs 0-4; 1 is fal's default. */
export const KREA_STYLE_SCALE_DEFAULT = 1;
export const KREA_STYLE_SCALE_OPTIONS: readonly number[] = [
  0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4,
];

export const styleScaleOptions = (current: number): readonly number[] =>
  KREA_STYLE_SCALE_OPTIONS.includes(current)
    ? KREA_STYLE_SCALE_OPTIONS
    : [...KREA_STYLE_SCALE_OPTIONS, current].sort((a, b) => a - b);
