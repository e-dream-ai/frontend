import {
  BRIGHTNESS,
  INITIAL_DECODER_FPS,
  SPEEDS,
} from "@/constants/web-client.constants";
import { Dream } from "@/types/dream.types";
import { Playlist, PlaylistItem } from "@/types/playlist.types";

type NavigationResult = {
  next: PlaylistItem | null;
  previous: PlaylistItem | null;
};

export const getPlaylistNavigation = (
  currentDream?: Dream,
  playlist?: Playlist,
): NavigationResult => {
  // ensure we have items to work with
  const items = playlist?.items || [];

  if (!items.length || !currentDream) {
    return { next: null, previous: null };
  }

  // find the current item index
  const currentIndex = items.findIndex(
    (item) => item.type === "dream" && item.dreamItem?.id === currentDream.id,
  );

  // if dream not found in playlist
  if (currentIndex === -1) {
    return { next: null, previous: null };
  }

  // get next and previous indices
  const nextIndex = currentIndex + 1;
  const previousIndex = currentIndex - 1;

  // get next and previous items
  const next = nextIndex < items.length ? items[nextIndex] : null;
  const previous = previousIndex >= 0 ? items[previousIndex] : null;

  return { next, previous };
};

// get next item from navigation
export const getNextItem = (
  currentDream: Dream,
  playlist: Playlist,
): PlaylistItem | null => {
  return getPlaylistNavigation(currentDream, playlist).next;
};

// get previous item from navigation
export const getPreviousItem = (
  currentDream: Dream,
  playlist: Playlist,
): PlaylistItem | null => {
  return getPlaylistNavigation(currentDream, playlist).previous;
};

// helper function to find current speed key
export const findCurrentSpeedKey = (
  currentSpeed: number,
  speeds: typeof SPEEDS,
) => {
  return (
    Object.entries(speeds).find(([, value]) => value === currentSpeed)?.[0] ||
    "4"
  );
};

// helper function to find current brightness key
export const findCurrentBrightnessKey = (
  currentBrightness: number,
  brightnesses: typeof BRIGHTNESS,
) => {
  return (
    Object.entries(brightnesses).find(
      ([, value]) => value === currentBrightness,
    )?.[0] || "4"
  );
};

// from desktop client
export function speedToPerceptualFPS(speed: number) {
  return Math.pow(2.0, (speed + 1) / 2);
}

export function perceptualFPSToDecoderFPS(
  perceptualFPS: number = 1,
  activityLevel: number = 1,
) {
  return perceptualFPS / activityLevel;
}

export function calculatePlaybackRateFromSpeed(
  speed: number,
  activityLevel: number = 1,
) {
  return (
    perceptualFPSToDecoderFPS(speedToPerceptualFPS(speed), activityLevel) /
    INITIAL_DECODER_FPS
  );
}

export function multiplyPerceptualFPS(
  multiplier: number,
  perceptualFPS: number,
) {
  return multiplier * perceptualFPS;
}

export function tapsToBrightness(taps: number) {
  return Math.pow(2.0, taps / 40) - 1;
}
