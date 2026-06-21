import type { StudioImage } from "@/types/studio.types";

export type DreamJobStatus = StudioImage["status"];

const SOCKET_TO_STATUS: Record<string, DreamJobStatus> = {
  COMPLETED: "processed",
  PROCESSED: "processed",
  IN_PROGRESS: "processing",
  PROCESSING: "processing",
  IN_QUEUE: "queue",
  QUEUE: "queue",
  FAILED: "failed",
  TIMED_OUT: "failed",
  CANCELLED: "failed",
};

export const mapSocketStatus = (raw?: string): DreamJobStatus | undefined =>
  raw ? SOCKET_TO_STATUS[raw.toUpperCase()] : undefined;

const STATUS_RANK: Record<string, number> = {
  queue: 0,
  processing: 1,
  processed: 2,
  failed: 2,
};

export const isPendingStatus = (status: string | null | undefined): boolean =>
  status === "queue" || status === "processing";

export const shouldApplyStatus = (
  current: string | null | undefined,
  next: string | null | undefined,
): boolean => {
  if (!next) return false;
  if (!current) return true;
  return (STATUS_RANK[next] ?? 0) >= (STATUS_RANK[current] ?? 0);
};
