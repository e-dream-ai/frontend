/**
 * CSS `aspect-ratio` for a dream's processed media, or undefined when the
 * backend has no dimensions for it.
 *
 * The picker cards take their shape from the image itself, which means the
 * grid would reflow as each thumbnail loads. `processedMediaWidth`/`Height`
 * (set by the video service — see video/utils/process_image.py) let us reserve
 * the correct box up front. They are nullable for older dreams, dreams still
 * processing, and keyframes, so callers must tolerate undefined: the image's
 * intrinsic ratio still takes over once it loads.
 */
export const mediaAspectRatio = (
  width?: number | null,
  height?: number | null,
): string | undefined =>
  typeof width === "number" &&
  typeof height === "number" &&
  width > 0 &&
  height > 0
    ? `${width} / ${height}`
    : undefined;
