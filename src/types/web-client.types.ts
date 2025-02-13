import { BRIGHTNESS, SPEEDS } from "@/constants/web-client.constants";
import { Dream } from "./dream.types";

export type SpeedKey = keyof typeof SPEEDS;
export type BrightnessKey = keyof typeof BRIGHTNESS;
export type SpeedLevels = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SpeedControls = Record<`set_speed_${SpeedLevels}`, () => void>;

export type PlaylistNavigation = {
  next: Dream | null;
  previous: Dream | null;
  isNextConcatenated: boolean;
};
