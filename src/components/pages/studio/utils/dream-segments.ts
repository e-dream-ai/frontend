import type { Dream } from "@/types/dream.types";
import type { CrossfadeSegment } from "../components/crossfade-video";
import { mediaAspectRatio } from "./media-aspect-ratio";

export const dreamsToSegments = (
  uuids: readonly string[],
  dreams: readonly (Dream | undefined)[],
): CrossfadeSegment[] =>
  uuids.flatMap((uuid, i) => {
    const dream = dreams[i];
    // Prefer the original over the processed file. Processing normalises every
    // video to 1920x1080, so the processed copy of a square render is 16:9 and
    // would show the clip in the wrong shape. The original keeps the shape the
    // model produced, and is what processedMediaWidth/Height measures.
    const url = dream?.original_video || dream?.video;
    if (!url) return [];
    return [
      {
        key: uuid,
        url,
        poster: dream?.thumbnail,
        ratio: mediaAspectRatio(
          dream?.processedMediaWidth,
          dream?.processedMediaHeight,
        ),
      },
    ];
  });
