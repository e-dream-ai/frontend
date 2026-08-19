export const RANDOM_SEED = -1;

export const MAX_SEED = 4_294_967_295;

export const SEED_HINT = `${RANDOM_SEED} = random`;

export const SEED_DRAFT_PATTERN = /^-?\d*$/;

export const clampSeed = (seed: number): number => {
  if (!Number.isFinite(seed)) return RANDOM_SEED;
  const whole = Math.trunc(seed);
  if (whole < 0) return RANDOM_SEED;
  return Math.min(whole, MAX_SEED);
};
