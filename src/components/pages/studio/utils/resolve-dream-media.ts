import { getDream } from "@/api/dream/query/useDream";
import { DreamStatusType, type Dream } from "@/types/dream.types";

const POLL_INTERVAL_MS = 2000;
const MAX_WAIT_MS = 120_000;

export const dreamMediaUrl = (dream?: Dream): string =>
  dream?.video || dream?.original_video || "";

export class DreamMediaAborted extends Error {
  constructor() {
    super("Dream media polling aborted");
    this.name = "DreamMediaAborted";
  }
}

const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    const done = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    signal?.addEventListener("abort", done, { once: true });
  });

interface Options {
  intervalMs?: number;
  maxWaitMs?: number;
  signal?: AbortSignal;
}

export const resolveDreamMedia = async (
  uuid: string,
  {
    intervalMs = POLL_INTERVAL_MS,
    maxWaitMs = MAX_WAIT_MS,
    signal,
  }: Options = {},
): Promise<Dream | undefined> => {
  const deadline = Date.now() + maxWaitMs;

  for (;;) {
    if (signal?.aborted) throw new DreamMediaAborted();

    const dream = await getDream(uuid, signal).catch(() => undefined);

    if (signal?.aborted) throw new DreamMediaAborted();
    if (dreamMediaUrl(dream)) return dream;
    if (dream?.status === DreamStatusType.FAILED) return undefined;
    if (Date.now() >= deadline) return undefined;

    await delay(intervalMs, signal);
  }
};
