import { useEffect, useMemo, useRef } from "react";
import { useQueries, type QueryFunctionContext } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useFlowStore } from "@/stores/flow.store";
import { DREAM_QUERY_KEY, getDream } from "@/api/dream/query/useDream";
import type { Dream } from "@/types/dream.types";
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

export function TransitionHistory() {
  const { transitions, selectedIndices } = useFlowStore(
    useShallow((s) => ({
      transitions: s.transitions,
      selectedIndices: s.selectedTransitionIndices,
    })),
  );

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
    queries: entries.map((entry) => ({
      queryKey: [DREAM_QUERY_KEY, entry.dreamUuid],
      queryFn: ({ signal }: QueryFunctionContext) =>
        getDream(entry.dreamUuid, signal),
      staleTime: Infinity,
      // A just-finished dream has no filmstrip until the video service has run.
      refetchInterval: (data: unknown) =>
        (data as Dream | undefined)?.filmstrip?.length ? false : 5000,
      refetchIntervalInBackground: false,
    })),
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
                    : `Restore the take generated ${time}`
                }
                aria-label={
                  isCurrent
                    ? `Take ${i + 1} of ${
                        entries.length
                      }, generated ${time}. Currently in the flow.`
                    : `Take ${i + 1} of ${
                        entries.length
                      }, generated ${time}. Activate to restore it.`
                }
                onClick={() => {
                  if (isCurrent) return;
                  useFlowStore
                    .getState()
                    .restoreTransitionRun(index, entry.dreamUuid);
                }}
              >
                <HistoryThumb $current={isCurrent}>
                  {thumb ? (
                    <img src={thumb} alt="" loading="lazy" />
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
    </HistoryInline>
  );
}
