import { useQueries, type QueryFunctionContext } from "@tanstack/react-query";
import { DREAM_QUERY_KEY, getDream } from "@/api/dream/query/useDream";
import type { Dream } from "@/types/dream.types";
import type { CrossfadeSegment } from "../components/crossfade-video";
import { mediaAspectRatio } from "../utils/media-aspect-ratio";

/**
 * Resolves dream UUIDs into playable preview segments, polling each dream
 * until its video lands. Dreams whose media is not ready yet are dropped, so
 * the returned list is shorter than `uuids` while renders are still landing —
 * callers that need to address a specific dream must look it up by `key`
 * rather than by position in the input.
 *
 * Shared by the flow preview and the action studio's results preview.
 */
export function useDreamSegments(uuids: readonly string[]): CrossfadeSegment[] {
  const dreamQueries = useQueries({
    queries: uuids.map((uuid) => ({
      queryKey: [DREAM_QUERY_KEY, uuid],
      queryFn: ({ signal }: QueryFunctionContext) => getDream(uuid, signal),
      staleTime: Infinity,
      refetchInterval: (data: unknown) =>
        (data as Dream | undefined)?.video ? false : 3000,
      refetchIntervalInBackground: false,
    })),
  });

  // Not memoized: `useQueries` returns a fresh array every render, so a useMemo
  // keyed on it would never hit.
  return dreamQueries.flatMap((q, i) => {
    // Prefer the original over the processed file. Processing normalises every
    // video to 1920x1080, so the processed copy of a square render is 16:9 and
    // would show the clip in the wrong shape. The original keeps the shape the
    // model produced, and is what processedMediaWidth/Height measures.
    const url = q.data?.original_video || q.data?.video;
    if (!url) return [];
    return [
      {
        key: uuids[i],
        url,
        poster: q.data?.thumbnail,
        ratio: mediaAspectRatio(
          q.data?.processedMediaWidth,
          q.data?.processedMediaHeight,
        ),
      },
    ];
  });
}
