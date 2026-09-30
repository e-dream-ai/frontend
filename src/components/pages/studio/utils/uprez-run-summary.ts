import type { RunPlaylistResult } from "@/api/playlist/mutation/useRunPlaylist";

/** Whether a run with this result would change anything. */
export const uprezRunHasWork = (result: RunPlaylistResult): boolean =>
  result.created +
    result.requeued +
    (result.reused ?? 0) +
    (result.replaced ?? 0) +
    result.removed >
  0;

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

/**
 * What a run does, in words. `planned` phrases it as what *would* happen,
 * for a preview; otherwise as what just started.
 */
export const formatUprezRunSummary = (
  result: RunPlaylistResult,
  planned = false,
): string => {
  if (!uprezRunHasWork(result)) {
    return planned
      ? "Everything is up to date at these settings."
      : "Everything was already up to date.";
  }

  const renders = result.created + result.requeued;
  const parts = [
    renders > 0 && `render ${plural(renders, "dream")}`,
    result.reused > 0 && `reuse ${plural(result.reused, "earlier render")}`,
    result.replaced > 0 &&
      `swap out ${plural(result.replaced, "dream")} at other settings` +
        (result.cancelled > 0
          ? ` (cancelling ${result.cancelled} in progress)`
          : ""),
    result.removed > 0 &&
      `remove ${plural(result.removed, "dream")} no longer in the source`,
  ].filter(Boolean) as string[];

  const sentence = parts.join(", ");
  return planned
    ? `Running will ${sentence}.`
    : `Uprez run started: ${sentence}.`;
};
