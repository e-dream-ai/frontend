import { useMemo } from "react";
import {
  useQueries,
  type QueryFunctionContext,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useStudioStore, comboKeyOf } from "@/stores/studio.store";
import { DREAM_QUERY_KEY, getDreamResponse } from "@/api/dream/query/useDream";
import type { Dream } from "@/types/dream.types";
import type { ApiResponse } from "@/types/api.types";
import {
  formatRunTime,
  lastFilmstripUrl,
} from "../utils/transition-history.util";
import {
  findCellJob,
  isAnimatableFrame,
  isCellChecked,
  isJobInFlight,
  isRunnableAction,
} from "../utils/batch-selectors";
import { useRestoreStudioClip } from "../hooks/useStudioClipActions";
import { GenerateSection, SectionTitle } from "./images-tab.styled";
import {
  HistoryItem,
  HistoryPlaceholder,
  HistoryTime,
  HistoryEmpty,
} from "./transition-history.styled";
import { ClipHistoryGrid, ClipHistoryThumb } from "./generate-tab.styled";

/**
 * Must store the whole ApiResponse: `[DREAM_QUERY_KEY, uuid]` is one cache
 * entry shared with `useDreamSegments` and `useDream` (see TransitionHistory).
 */
type DreamQueryOptions = UseQueryOptions<
  ApiResponse<{ dream: Dream }>,
  unknown,
  Dream | undefined,
  [string, string]
>;

/**
 * Clips taken out of the matrix — discarded, or replaced by a re-render —
 * newest first. Only those whose cell is checked in the matrix show, so
 * ticking a cell is how you look through its earlier takes. Clicking one puts
 * it back in its cell.
 */
export function ClipHistory({
  onRestore,
}: {
  /** Called with the dream once it is back in its cell, to play it. */
  onRestore?: (dreamUuid: string) => void;
}) {
  const allHistoryJobs = useStudioStore((s) => s.historyJobs);
  const jobs = useStudioStore((s) => s.jobs);
  const excludedCombos = useStudioStore((s) => s.excludedCombos);
  const rerenderCombos = useStudioStore((s) => s.rerenderCombos);
  const images = useStudioStore((s) => s.images);
  const actions = useStudioStore((s) => s.actions);
  const restore = useRestoreStudioClip();

  // A cell whose image or action is gone has no checkbox, so its clips drop
  // out along with it.
  const historyJobs = useMemo(() => {
    const imageIds = new Set(
      images.filter(isAnimatableFrame).map((i) => i.uuid),
    );
    const actionIds = new Set(
      actions.filter(isRunnableAction).map((a) => a.id),
    );
    return allHistoryJobs.filter(
      (job) =>
        imageIds.has(job.imageId) &&
        actionIds.has(job.actionId) &&
        isCellChecked(
          findCellJob(jobs, job.imageId, job.actionId),
          comboKeyOf(job.imageId, job.actionId),
          excludedCombos,
          rerenderCombos,
        ),
    );
  }, [allHistoryJobs, images, actions, jobs, excludedCombos, rerenderCombos]);

  const dreamQueries = useQueries({
    queries: historyJobs.map(
      (job): DreamQueryOptions => ({
        queryKey: [DREAM_QUERY_KEY, job.dreamUuid],
        queryFn: ({ signal }: QueryFunctionContext) =>
          getDreamResponse(job.dreamUuid, signal),
        select: (response) => response.data?.dream,
        staleTime: Infinity,
        // Read the unselected response: the cache holds what the query
        // function returned, not what `select` derived.
        refetchInterval: (_data, query) =>
          query.state.data?.data?.dream?.filmstrip?.length ? false : 5000,
        refetchIntervalInBackground: false,
      }),
    ),
  });

  const imageNames = useMemo(
    () => new Map(images.map((i) => [i.uuid, i.name])),
    [images],
  );

  return (
    <GenerateSection>
      <SectionTitle>History</SectionTitle>
      {historyJobs.length === 0 ? (
        <HistoryEmpty>
          {allHistoryJobs.length === 0
            ? "Discarded and replaced clips show up here"
            : "Check a cell in the matrix to see its earlier clips"}
        </HistoryEmpty>
      ) : (
        <ClipHistoryGrid role="list">
          {historyJobs.map((job, i) => {
            const dream = dreamQueries[i]?.data;
            const thumb = lastFilmstripUrl(dream);
            const generatedAt =
              job.completedAt ??
              (dream
                ? Date.parse(dream.processed_at ?? dream.created_at)
                : NaN);
            const time = Number.isFinite(generatedAt)
              ? formatRunTime(generatedAt)
              : "…";
            const actionIndex = actions
              .filter(isRunnableAction)
              .findIndex((a) => a.id === job.actionId);
            const cell = `${imageNames.get(job.imageId) ?? "Removed image"}, ${
              actionIndex >= 0 ? `action ${actionIndex + 1}` : "removed action"
            }`;
            const current = findCellJob(jobs, job.imageId, job.actionId);
            const blocked = current !== undefined && isJobInFlight(current);
            return (
              <HistoryItem
                key={job.dreamUuid}
                type="button"
                role="listitem"
                $current={false}
                disabled={blocked}
                title={
                  blocked
                    ? `${cell} — wait for its render to finish to restore this`
                    : `${cell} — generated ${time}. Click to restore it.`
                }
                aria-label={`${cell}, generated ${time}. Activate to restore it.`}
                onClick={() => {
                  if (restore(job.dreamUuid)) onRestore?.(job.dreamUuid);
                }}
              >
                <ClipHistoryThumb $current={false}>
                  {thumb ? (
                    <img src={thumb} alt="" loading="lazy" />
                  ) : (
                    <HistoryPlaceholder>…</HistoryPlaceholder>
                  )}
                </ClipHistoryThumb>
                <HistoryTime $current={false}>{time}</HistoryTime>
              </HistoryItem>
            );
          })}
        </ClipHistoryGrid>
      )}
    </GenerateSection>
  );
}
