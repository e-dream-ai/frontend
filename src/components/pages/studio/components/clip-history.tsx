import { useMemo, useState } from "react";
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
import { HistoryClipDialog } from "./history-clip-dialog";
import {
  HistoryItem,
  HistoryPlaceholder,
  HistoryTime,
  HistoryEmpty,
} from "./transition-history.styled";
import { ClipHistoryGrid, ClipHistoryThumb } from "./generate-tab.styled";
import { HISTORY_THUMB, sizedImageUrl } from "../utils/sized-image";

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
 * ticking a cell is how you look through its earlier takes. Clicking one plays
 * it with its details, and offers to put it back in its cell.
 *
 * With nothing checked, it shows every removed clip instead; restoring one
 * whose image or action has been removed brings that back too.
 */
export function ClipHistory({
  onRestore,
  showRemoved = false,
}: {
  /** Called with the dream once it is back in its cell, to play it. */
  onRestore?: (dreamUuid: string) => void;
  /** Nothing in the matrix is checked, so show every removed clip. */
  showRemoved?: boolean;
}) {
  const allHistoryJobs = useStudioStore((s) => s.historyJobs);
  const jobs = useStudioStore((s) => s.jobs);
  const excludedCombos = useStudioStore((s) => s.excludedCombos);
  const rerenderCombos = useStudioStore((s) => s.rerenderCombos);
  const images = useStudioStore((s) => s.images);
  const actions = useStudioStore((s) => s.actions);
  const removedImages = useStudioStore((s) => s.removedImages);
  const removedActions = useStudioStore((s) => s.removedActions);
  const restore = useRestoreStudioClip();
  const [openUuid, setOpenUuid] = useState<string | null>(null);

  // A cell whose image or action is gone has no checkbox, so its clips drop
  // out along with it.
  const checkedJobs = useMemo(() => {
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

  // Every removed clip that can go back in a cell: its image and action are
  // there, or were removed and can come back with it.
  const allJobs = useMemo(() => {
    const imageIds = new Set(images.map((i) => i.uuid));
    const actionIds = new Set(actions.map((a) => a.id));
    const gone = (id: string, present: Set<string>, kept: Set<string>) =>
      !present.has(id) && kept.has(id);
    const keptImages = new Set(removedImages.map((r) => r.item.uuid));
    const keptActions = new Set(removedActions.map((r) => r.item.id));
    return allHistoryJobs.filter((job) => {
      const imageOk =
        imageIds.has(job.imageId) || gone(job.imageId, imageIds, keptImages);
      const actionOk =
        actionIds.has(job.actionId) ||
        gone(job.actionId, actionIds, keptActions);
      return imageOk && actionOk;
    });
  }, [allHistoryJobs, images, actions, removedImages, removedActions]);

  const showingAll = checkedJobs.length === 0 && showRemoved;
  const historyJobs = showingAll ? allJobs : checkedJobs;

  // Tracked by dream, so the dialog closes by itself if its clip leaves the list.
  const openIndex = historyJobs.findIndex((j) => j.dreamUuid === openUuid);

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
    () =>
      new Map([
        ...removedImages.map((r) => [r.item.uuid, r.item.name] as const),
        ...images.map((i) => [i.uuid, i.name] as const),
      ]),
    [images, removedImages],
  );
  const removedPrompts = useMemo(
    () => new Map(removedActions.map((r) => [r.item.id, r.item.prompt])),
    [removedActions],
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
        <>
          {showingAll && (
            <HistoryEmpty>
              All removed clips. Click one to look at it.
            </HistoryEmpty>
          )}
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
              const removedPrompt = removedPrompts.get(job.actionId);
              const cell = `${
                imageNames.get(job.imageId) ?? "Removed image"
              }, ${
                actionIndex >= 0
                  ? `action ${actionIndex + 1}`
                  : removedPrompt
                    ? `removed action "${removedPrompt.slice(0, 60)}"`
                    : "removed action"
              }`;
              return (
                <HistoryItem
                  key={job.dreamUuid}
                  type="button"
                  role="listitem"
                  $current={false}
                  aria-label={`${cell}, generated ${time}. Activate to view it.`}
                  onClick={() => setOpenUuid(job.dreamUuid)}
                >
                  <ClipHistoryThumb $current={false}>
                    {thumb ? (
                      <img
                        src={sizedImageUrl(thumb, HISTORY_THUMB)}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <HistoryPlaceholder>…</HistoryPlaceholder>
                    )}
                  </ClipHistoryThumb>
                  <HistoryTime $current={false}>{time}</HistoryTime>
                </HistoryItem>
              );
            })}
          </ClipHistoryGrid>
        </>
      )}
      {openIndex >= 0 &&
        (() => {
          const job = historyJobs[openIndex];
          const runnable = actions.filter(isRunnableAction);
          const actionIndex = runnable.findIndex((a) => a.id === job.actionId);
          const current = findCellJob(jobs, job.imageId, job.actionId);
          return (
            <HistoryClipDialog
              job={job}
              dream={dreamQueries[openIndex]?.data}
              imageName={imageNames.get(job.imageId) ?? "Unknown image"}
              imageRemoved={!images.some((i) => i.uuid === job.imageId)}
              actionNumber={actionIndex >= 0 ? actionIndex + 1 : undefined}
              actionPrompt={
                actions.find((a) => a.id === job.actionId)?.prompt ??
                removedPrompts.get(job.actionId)
              }
              actionRemoved={!actions.some((a) => a.id === job.actionId)}
              current={current}
              blocked={current !== undefined && isJobInFlight(current)}
              onPutBack={() => {
                setOpenUuid(null);
                if (restore(job.dreamUuid)) onRestore?.(job.dreamUuid);
              }}
              onClose={() => setOpenUuid(null)}
            />
          );
        })()}
    </GenerateSection>
  );
}
