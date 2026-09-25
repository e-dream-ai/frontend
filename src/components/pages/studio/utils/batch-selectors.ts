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
