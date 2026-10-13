import type { DeforumClip } from "@/types/deforum.types";
import { useDreamPreviewFrame } from "@/api/dream/query/useDreamPreviewFrame";
import { pendingRender } from "../utils/deforum-targets";

/**
 * The latest frame of the clip's render in progress, if it has one. Shared
 * with the clip card through the query cache, so a clip moved to History keeps
 * the frame it was showing.
 */
export function useDeforumLiveFrame(clip: DeforumClip): string | undefined {
  const pending = pendingRender(clip)?.render;
  const frame = useDreamPreviewFrame(pending?.dreamUuid, Boolean(pending));
  return pending ? frame?.src : undefined;
}
