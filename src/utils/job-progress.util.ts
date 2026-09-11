import type {
  DreamJobProgress,
  JobStage,
  JobStatus,
} from "@/types/job-progress.types";

export interface DreamProgressSource {
  uuid: string;
  status: string;
  jobProgress?: DreamJobProgress;
  updated_at?: string;
}

const DREAM_STATES: Record<string, [JobStatus, JobStage]> = {
  queue: ["IN_QUEUE", "queued"],
  processing: ["IN_PROGRESS", "ingesting"],
  processed: ["COMPLETED", "completed"],
  failed: ["FAILED", "failed"],
  none: ["CANCELLED", "idle"],
};

export const isActiveProgress = (progress?: DreamJobProgress) =>
  progress?.stage === "queued" ||
  progress?.stage === "rendering" ||
  progress?.stage === "ingesting";

export function progressFromDream(
  dream: DreamProgressSource,
): DreamJobProgress {
  if (dream.jobProgress) return dream.jobProgress;

  const [status, stage] = DREAM_STATES[dream.status] ?? ["CANCELLED", "idle"];
  return {
    dream_uuid: dream.uuid,
    status,
    stage,
    progress: stage === "completed" ? 100 : null,
    countdown_ms: null,
    updated_at: dream.updated_at ? Date.parse(dream.updated_at) : 0,
  };
}

export function latestProgress(
  current: DreamJobProgress | undefined,
  next: DreamJobProgress,
): DreamJobProgress {
  if (!current) return next;
  if (current.run_id && next.run_id && current.run_id !== next.run_id) {
    return (next.run_started_at ?? 0) > (current.run_started_at ?? 0)
      ? next
      : current;
  }
  return next.updated_at >= current.updated_at ? next : current;
}
