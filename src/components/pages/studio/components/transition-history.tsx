import { useEffect, useMemo, useRef, useState } from "react";
import {
  useQueries,
  type QueryFunctionContext,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import {
  buildFramesWithLoop,
  LOOP_FRAME_ID,
  useFlowStore,
} from "@/stores/flow.store";
import { DREAM_QUERY_KEY, getDreamResponse } from "@/api/dream/query/useDream";
import type { Dream } from "@/types/dream.types";
import type { ApiResponse } from "@/types/api.types";
import {
  middleFilmstripUrl,
  formatRunTime,
} from "../utils/transition-history.util";
import {
  HistoryInline,
  HistoryTitle,
  HistoryRail,
  HistoryItem,
  HistoryThumb,
  HistoryPlaceholder,
  HistoryTime,
  HistoryEmpty,
} from "./transition-history.styled";
import { HISTORY_THUMB, sizedImageUrl } from "../utils/sized-image";
import { FlowTakeDialog } from "./flow-take-dialog";

/**
 * `[DREAM_QUERY_KEY, uuid]` is one cache entry shared with `useDreamSegments`,
 * `useDreamProgress` and `useDream`. They all store the whole ApiResponse, so
 * this query must too — storing an unwrapped Dream here makes the two readers
 * overwrite each other, blanking thumbnails and dropping preview segments.
 */
type DreamQueryOptions = UseQueryOptions<
  ApiResponse<{ dream: Dream }>,
  unknown,
  Dream | undefined,
  [string, string]
>;

export function TransitionHistory() {
  const { transitions, selectedIndices, referenceFrames, loop } = useFlowStore(
    useShallow((s) => ({
      transitions: s.transitions,
      selectedIndices: s.selectedTransitionIndices,
      referenceFrames: s.referenceFrames,
      loop: s.loop,
    })),
  );
  const [openUuid, setOpenUuid] = useState<string | null>(null);

  // Restoring a take rewrites one position's settings, so it only makes sense
  // against a single transition. With several selected there is no "this one".
  const index = selectedIndices.length === 1 ? selectedIndices[0] : null;
  const transition = index === null ? undefined : transitions[index];

  const entries = useMemo(
    () =>
      (transition?.history ?? [])
        .filter((entry) => entry.completed)
        .slice()
        .sort((a, b) => a.createdAt - b.createdAt),
    [transition?.history],
  );

  const dreamQueries = useQueries({
    queries: entries.map(
      (entry): DreamQueryOptions => ({
        queryKey: [DREAM_QUERY_KEY, entry.dreamUuid],
        queryFn: ({ signal }: QueryFunctionContext) =>
          getDreamResponse(entry.dreamUuid, signal),
        select: (response) => response.data?.dream,
        staleTime: Infinity,
        // A just-finished dream has no filmstrip until the video service has
        // run. Read the unselected response: the cache holds what the query
        // function returned, not what `select` derived.
        refetchInterval: (_data, query) =>
          query.state.data?.data?.dream?.filmstrip?.length ? false : 5000,
        refetchIntervalInBackground: false,
      }),
    ),
  });

  // Takes run oldest-to-newest, so the current one is usually rightmost — and
  // in a narrow header the rail scrolls, which would leave it clipped out of
  // view. Keep whichever take is live in the flow on screen.
  const currentRef = useRef<HTMLButtonElement>(null);
  const currentUuid = transition?.dreamUuid;
  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [currentUuid, entries.length]);

  if (index === null || !transition) return null;

  // Tracked by dream, so the dialog closes by itself if its take leaves the
  // list — another transition selected, or the take aged out of history.
  const openIndex = entries.findIndex((e) => e.dreamUuid === openUuid);
  const openEntry = openIndex >= 0 ? entries[openIndex] : undefined;
  const frameName = (id: string) => {
    const frame = buildFramesWithLoop(referenceFrames, loop).find(
      (f) => f.id === id,
    );
    if (!frame) return "Unknown frame";
    return id === LOOP_FRAME_ID ? `${frame.name} (loop)` : frame.name;
  };

  return (
    <HistoryInline>
      <HistoryTitle>History</HistoryTitle>
      {entries.length === 0 ? (
        <HistoryEmpty>No takes yet</HistoryEmpty>
      ) : (
        <HistoryRail role="list">
          {entries.map((entry, i) => {
            const isCurrent = entry.dreamUuid === transition.dreamUuid;
            const thumb = middleFilmstripUrl(dreamQueries[i]?.data);
            const time = formatRunTime(entry.createdAt);
            return (
              <HistoryItem
                key={entry.dreamUuid}
                ref={isCurrent ? currentRef : undefined}
                type="button"
                role="listitem"
                $current={isCurrent}
                aria-current={isCurrent}
                title={
                  isCurrent
                    ? `Current take, generated ${time}`
                    : `View the take generated ${time}`
                }
                aria-label={
                  isCurrent
                    ? `Take ${i + 1} of ${
                        entries.length
                      }, generated ${time}. Currently in the flow.`
                    : `Take ${i + 1} of ${
                        entries.length
                      }, generated ${time}. Activate to view it.`
                }
                onClick={() => setOpenUuid(entry.dreamUuid)}
              >
                <HistoryThumb $current={isCurrent}>
                  {thumb ? (
                    <img
                      src={sizedImageUrl(thumb, HISTORY_THUMB)}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <HistoryPlaceholder>…</HistoryPlaceholder>
                  )}
                </HistoryThumb>
                <HistoryTime $current={isCurrent}>{time}</HistoryTime>
              </HistoryItem>
            );
          })}
        </HistoryRail>
      )}
      {openEntry && (
        <FlowTakeDialog
          entry={openEntry}
          dream={dreamQueries[openIndex]?.data}
          takeNumber={openIndex + 1}
          takeCount={entries.length}
          fromName={frameName(transition.fromFrameId)}
          toName={frameName(transition.toFrameId)}
          isCurrent={openEntry.dreamUuid === transition.dreamUuid}
          dropsUprez={transition.uprezDreamUuid !== undefined}
          blocked={
            transition.status === "queue" || transition.status === "processing"
          }
          onPutBack={() => {
            setOpenUuid(null);
            useFlowStore
              .getState()
              .restoreTransitionRun(index, openEntry.dreamUuid);
          }}
          onClose={() => setOpenUuid(null)}
        />
      )}
    </HistoryInline>
  );
}
