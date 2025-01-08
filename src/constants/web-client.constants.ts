export const SPEEDS = {
  0: 0, // pause
  1: 0.25,
  2: 0.5,
  3: 0.75,
  4: 1, // normal
  5: 1.25,
  6: 1.5,
  7: 1.75,
  8: 1.85,
  9: 2, // fastest
} as const;

export const BRIGHTNESS = {
  0: 0, // darkest
  1: 0.25,
  2: 0.5,
  3: 0.75,
  4: 1, // normal
  5: 1.25,
  6: 1.5,
  7: 1.75,
  8: 1.85,
  9: 2, // brightest
} as const;

export const IS_WEB_CLIENT_ACTIVE =
  import.meta.env.VITE_IS_WEB_CLIENT_ACTIVE === "true";
