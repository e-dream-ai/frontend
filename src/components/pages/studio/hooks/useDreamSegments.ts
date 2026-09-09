import { useMemo } from "react";
import {
  useQueries,
  type QueryFunctionContext,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { DREAM_QUERY_KEY, getDream } from "@/api/dream/query/useDream";
import type { Dream } from "@/types/dream.types";
import type { CrossfadeSegment } from "../components/crossfade-video";
import { dreamsToSegments } from "../utils/dream-segments";

const POLL_INTERVAL_MS = 3000;

type DreamQueryOptions = UseQueryOptions<
  Dream | undefined,
  unknown,
  Dream | undefined,
  [string, string]
>;

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
    queries: uuids.map(
      (uuid): DreamQueryOptions => ({
        queryKey: [DREAM_QUERY_KEY, uuid],
        queryFn: ({ signal }: QueryFunctionContext) => getDream(uuid, signal),
        staleTime: Infinity,
        refetchInterval: (data) => (data?.video ? false : POLL_INTERVAL_MS),
        refetchIntervalInBackground: false,
      }),
    ),
  });

  const segments = dreamsToSegments(
    uuids,
    dreamQueries.map((q) => q.data),
  );

  const signature = JSON.stringify(segments);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on signature, not the churning array identity
  return useMemo(() => segments, [signature]);
}
