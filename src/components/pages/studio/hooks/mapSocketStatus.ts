import type { StudioImage } from "@/types/studio.types";

/**
 * Maps Socket.IO job:progress status strings (UPPERCASE) to
 * StudioImage/StudioJob status strings (lowercase).
 * Returns undefined if the status is unrecognized (caller should skip update).
 */
export const mapSocketStatus = (
  raw?: string,
): StudioImage["status"] | undefined => {
  if (raw === "COMPLETED") return "processed";
  if (raw === "IN_PROGRESS") return "processing";
  if (raw === "IN_QUEUE") return "queue";
  if (raw === "FAILED") return "failed";
  return undefined;
};
