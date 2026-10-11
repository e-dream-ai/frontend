import type { PlaylistMediaSummary } from "../../../../types/playlist.types";
import type {
  InterpolationFactor,
  UpscaleFactor,
} from "../constants/uprez-factor-options";

/** Short side at or above this counts as already HD, so upscaling is off by default. */
const HD_SHORT_SIDE = 1080;

const formatFps = (fps: number) => String(Math.round(fps * 100) / 100);

export const formatResolution = (width: number, height: number) =>
  `${width}×${height}`;

/** `1280×720`, or `up to 1920×1080 (mixed)` when the dreams differ. */
export const describePlaylistResolution = (media: PlaylistMediaSummary) => {
  const resolution = formatResolution(media.width, media.height);
  return media.mixedResolution ? `up to ${resolution} (mixed)` : resolution;
};

/** `24 fps`, or `up to 30 fps (mixed)`; null when no dream reports one. */
export const describePlaylistFps = (media: PlaylistMediaSummary) => {
  if (media.fps === null) return null;
  const fps = `${formatFps(media.fps)} fps`;
  return media.mixedFps ? `up to ${fps} (mixed)` : fps;
};

export const defaultUpscaleFactor = (
  media: PlaylistMediaSummary | null | undefined,
): UpscaleFactor =>
  media && Math.min(media.width, media.height) >= HD_SHORT_SIDE ? 1 : 2;

/**
 * What the uprez will produce, e.g. `1280×720 → 2560×1440 · 24 → 48 fps`.
 * Mixed playlists use the largest resolution and highest fps.
 */
export const describeUprezResult = (
  media: PlaylistMediaSummary,
  upscaleFactor: UpscaleFactor,
  interpolationFactor: InterpolationFactor,
) => {
  const source = formatResolution(media.width, media.height);
  const resolution =
    upscaleFactor === 1
      ? source
      : `${source} → ${formatResolution(
          media.width * upscaleFactor,
          media.height * upscaleFactor,
        )}`;
  if (media.fps === null) return resolution;

  const fps =
    interpolationFactor === 1
      ? `${formatFps(media.fps)} fps`
      : `${formatFps(media.fps)} → ${formatFps(
          media.fps * interpolationFactor,
        )} fps`;
  return `${resolution} · ${fps}`;
};
