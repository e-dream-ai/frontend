import { getDream } from "@/api/dream/query/useDream";
import { DreamStatusType } from "@/types/dream.types";

const POLL_INTERVAL_MS = 3000;
// A 10s Kling clip plus ingest; generous, since giving up early only costs the
// seam, not the render.
const MAX_WAIT_MS = 900_000;

interface Options {
  intervalMs?: number;
  maxWaitMs?: number;
  signal?: AbortSignal;
  now?: () => number;
  delay?: (ms: number) => Promise<void>;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Resolve once a clip has finished rendering *and* ingesting.
 *
 * Chaining the next clip onto this one's final frame needs the processed file
 * to exist, so this waits for `processed` rather than for a media URL to
 * appear — `original_video` is set before ingest normalises the video, and the
 * normalised copy is the one that plays.
 *
 * Returns false on failure or timeout, which callers treat as "fall back to
 * the keyframe" rather than as an error.
 */
export const waitForRenderedClip = async (
  uuid: string,
  {
    intervalMs = POLL_INTERVAL_MS,
    maxWaitMs = MAX_WAIT_MS,
    signal,
    now = Date.now,
    delay = sleep,
  }: Options = {},
): Promise<boolean> => {
  const deadline = now() + maxWaitMs;

  for (;;) {
    if (signal?.aborted) return false;

    const dream = await getDream(uuid, signal).catch(() => undefined);
    if (dream?.status === DreamStatusType.PROCESSED) return true;
    if (dream?.status === DreamStatusType.FAILED) return false;
    if (now() >= deadline) return false;

    await delay(intervalMs);
  }
};
