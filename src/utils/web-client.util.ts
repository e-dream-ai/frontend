import {
  BRIGHTNESS,
  INITIAL_DECODER_FPS,
  SPEEDS,
} from "@/constants/web-client.constants";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";

type NavigationResult = {
  next: Dream | null;
  previous: Dream | null;
};

// playlist navigation using keyframe concatenation based on -> https://github.com/e-dream-ai/client/issues/89
export const getPlaylistNavigation = ({
  currentDream,
  playlist,
  playedDreams,
}: {
  currentDream?: Dream;
  playlist?: Playlist;
  playedDreams: string[];
}): NavigationResult => {
  // if there are no items or current dream return null values
  if (!playlist?.items) {
    return {
      previous: null,
      next: null,
    };
  }

  // get previous dream
  const previousDream =
    playlist.items?.find(
      // playedDreams.at(-2) skips current dream which is last in array
      (pi) => pi.dreamItem?.uuid === playedDreams.at(-2),
    )?.dreamItem ??
    // if there are no items on played dreams array, take the current dream
    currentDream;

  // calculate unplayed dreams
  const unplayedDreams: Dream[] =
    playlist?.items
      ?.filter((pi) => Boolean(pi.dreamItem))
      ?.filter((pi) => !playedDreams.includes(pi.dreamItem!.uuid))
      ?.map((pi) => pi.dreamItem!) ?? [];

  // find unplayed dreams with a startKeyframe that matches with current dream endkeyframe
  const concatenatedDreams = unplayedDreams.filter(
    (d) =>
      // first verify that end keyframe exists
      currentDream?.endKeyframe?.uuid &&
      d.startKeyframe?.uuid &&
      currentDream.endKeyframe.uuid === d.startKeyframe.uuid,
  );

  // if there are concatenated items, take one randomly and return it as next
  if (concatenatedDreams.length) {
    const randomDreamIndex = Math.floor(
      Math.random() * concatenatedDreams.length,
    );
    const randomDream = concatenatedDreams[randomDreamIndex];

    return {
      previous: previousDream ?? null,
      next: randomDream,
    };
  }

  return {
    previous: previousDream ?? null,
    // items are ordered, so return first unplayed dream
    next: unplayedDreams[0] ?? null,
  };
};

// get next item from navigation
export const getNextItem = (
  currentDream: Dream,
  playlist: Playlist,
  playedDreams: string[],
): Dream | null => {
  return getPlaylistNavigation({
    currentDream,
    playlist,
    playedDreams,
  }).next;
};

// get previous item from navigation
export const getPreviousItem = (
  currentDream: Dream,
  playlist: Playlist,
  playedDreams: string[],
): Dream | null => {
  return getPlaylistNavigation({
    currentDream,
    playlist,
    playedDreams,
  }).previous;
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
