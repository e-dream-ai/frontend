import {
  BRIGHTNESS,
  INITIAL_DECODER_FPS,
  SPEEDS,
} from "@/constants/web-client.constants";
import { Dream } from "@/types/dream.types";
import { HistoryItem, PlaylistNavigation } from "@/types/web-client.types";

// playlist navigation using keyframe concatenation based on -> https://github.com/e-dream-ai/client/issues/89
export const getPlaylistNavigation = ({
  playingDream,
  playingPlaylistDreams,
  history,
  historyPosition,
}: {
  playingDream?: Dream;
  playingPlaylistDreams?: Dream[];
  history: HistoryItem[];
  historyPosition: number;
}): PlaylistNavigation => {
  // if there are no items or current dream return null values
  if (!playingPlaylistDreams) {
    return {
      previous: null,
      next: null,
      isNextConcatenated: false,
      allDreamsPlayed: false,
    };
  }

  // check if history position matches last played dream position
  const highestHistoryPosition = Math.max(history.length - 1, 0);
  const previousHistoryPosition = Math.max(historyPosition - 1, 0);
  const nextHistoryPosition = Math.max(historyPosition + 1, 0);
  const isHistoryMatchingPlayback = historyPosition === highestHistoryPosition;

  // get previous dream
  const previousDream =
    history[previousHistoryPosition]?.dream ??
    // if there are no items on played dreams array, take the current dream
    playingDream;

  // if history position doesn't match last played dream, return proper next dream
  if (!isHistoryMatchingPlayback) {
    const nextDream = history[nextHistoryPosition].dream;

    return {
      previous: previousDream ?? null,
      next: nextDream ?? null,
      isNextConcatenated: false,
      allDreamsPlayed: false,
    };
  }

  // calculate unplayed dreams
  const unplayedDreams: Dream[] = playingPlaylistDreams?.filter(
    (d) => !history.find((h) => h.dream.uuid === d.uuid),
  );

  const allDreamsPlayed = !unplayedDreams.length;

  // find unplayed dreams with a startKeyframe that matches with current dream endkeyframe
  const concatenatedDreams = unplayedDreams.filter(
    (d) =>
      // first verify that end keyframe exists
      playingDream?.endKeyframe?.uuid &&
      d.startKeyframe?.uuid &&
      playingDream.endKeyframe.uuid === d.startKeyframe.uuid,
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
      isNextConcatenated: true,
      allDreamsPlayed,
    };
  }

  return {
    previous: previousDream ?? null,
    // items are ordered, so return first unplayed dream else first dream at history
    next: unplayedDreams[0] ?? history[0]?.dream ?? null,
    isNextConcatenated: false,
    allDreamsPlayed,
  };
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
