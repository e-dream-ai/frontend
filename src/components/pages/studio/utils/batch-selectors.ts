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
