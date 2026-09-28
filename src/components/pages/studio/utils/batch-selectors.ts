import type {
  StudioAction,
  StudioImage,
  StudioJob,
} from "@/types/studio.types";

export const isAnimatableFrame = (image: StudioImage) =>
  image.status === "processed";

export const isRunnableAction = (action: StudioAction) =>
  action.prompt.trim().length > 0;

/** Queued or rendering: the cell is busy and cannot be picked again. */
export const isJobInFlight = (job: StudioJob) =>
  job.status === "queue" || job.status === "processing";

/**
 * How many clips each action has in visible matrix cells, queued, rendering or
 * done. An action with any is in use: its settings are what made those clips,
 * so it is no longer edited in place (editing makes a copy), and removing it
 * asks first.
 */
export const actionClipCounts = (
  images: readonly StudioImage[],
  jobs: readonly StudioJob[],
) => {
  const frameIds = new Set(
    images.filter(isAnimatableFrame).map((image) => image.uuid),
  );
  const counts = new Map<string, number>();
  for (const j of jobs) {
    if (j.jobType === "uprez" || !frameIds.has(j.imageId)) continue;
    counts.set(j.actionId, (counts.get(j.actionId) ?? 0) + 1);
  }
  return counts;
};

/**
 * The clip a matrix cell holds, whatever model made it. A cell holds at most
 * one — submitting a cell replaces the job it had — and it keeps showing when
 * the model dropdown changes, rather than the cell reading as empty.
 */
export const findCellJob = (
  jobs: readonly StudioJob[],
  imageUuid: string,
  actionId: string,
) =>
  jobs.find(
    (j) =>
      j.imageId === imageUuid &&
      j.actionId === actionId &&
      j.jobType !== "uprez",
  );

/**
 * How many clips an image has in its matrix row: one per column whose cell
 * holds a job. A job for an action with no column (a blank prompt, or one
 * left from before removal discarded clips) is not in the row.
 */
export const imageClipCount = (
  jobs: readonly StudioJob[],
  actions: readonly StudioAction[],
  imageUuid: string,
) =>
  actions.filter(
    (action) =>
      isRunnableAction(action) &&
      findCellJob(jobs, imageUuid, action.id) !== undefined,
  ).length;

/**
 * Whether the cell's checkbox is ticked, i.e. whether the next Generate runs
 * it. An empty cell is on unless unchecked; a rendered or failed one is off
 * unless picked to re-render with the current settings; an in-flight one is
 * shown on but cannot be picked.
 */
export const isCellChecked = (
  job: StudioJob | undefined,
  comboKey: string,
  excludedCombos: ReadonlySet<string>,
  rerenderCombos: ReadonlySet<string>,
) => {
  if (!job) return !excludedCombos.has(comboKey);
  if (isJobInFlight(job)) return true;
  return rerenderCombos.has(comboKey);
};

/** Share of a job's work that is rendering; ingesting is the rest. */
const RENDER_SHARE = 0.9;

/**
 * How far along one job is, 0–1, for the batch progress meter. Rendering
 * counts by the worker's reported percent, and ingesting sits between the end
 * of the render and done, using its own percent when the ingest reports one.
 * A failed job counts as finished: it is not going to move any further, and
 * the meter would otherwise never reach the end.
 */
export const jobCompletion = (job: StudioJob): number => {
  const percent =
    job.progress !== undefined ? Math.min(Math.max(job.progress, 0), 100) : 0;
  switch (job.status) {
    case "processed":
    case "failed":
      return 1;
    case "queue":
      return 0;
    case "processing":
      return job.ingesting
        ? RENDER_SHARE + (1 - RENDER_SHARE) * (percent / 100)
        : RENDER_SHARE * (percent / 100);
  }
};
