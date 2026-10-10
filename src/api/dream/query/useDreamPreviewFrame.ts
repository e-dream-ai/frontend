import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import type { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";

export const DREAM_PREVIEW_FRAME_QUERY_KEY = "getDreamPreviewFrame";

/** How often a running render's latest frame is fetched. */
export const PREVIEW_FRAME_POLL_MS = 15_000;

const fetchPreviewFrame = async (
  uuid: string,
  signal?: AbortSignal,
): Promise<string | null> => {
  const { data } = await axiosClient.get<
    ApiResponse<{ preview_frame: string | null }>
  >(`/v1/dream/${uuid}/preview`, {
    headers: getRequestHeaders({ contentType: ContentType.json }),
    signal,
  });
  const frame = data?.data?.preview_frame;
  if (!frame) return null;
  return frame.startsWith("data:image")
    ? frame
    : `data:image/jpeg;base64,${frame}`;
};

/**
 * The latest frame of a render in progress — the same frame the dream page's
 * Preview button fetches — refreshed every PREVIEW_FRAME_POLL_MS while
 * `enabled`. Keeps showing the last frame it got when a poll comes back empty
 * (before the first frame lands, or after the job's frame expires).
 */
export const useDreamPreviewFrame = (
  uuid: string | undefined,
  enabled: boolean,
): string | null => {
  const last = useRef<{ uuid?: string; frame: string | null }>({
    frame: null,
  });
  const { data } = useQuery(
    [DREAM_PREVIEW_FRAME_QUERY_KEY, uuid],
    ({ signal }) => fetchPreviewFrame(uuid!, signal),
    {
      enabled: Boolean(uuid) && enabled,
      refetchInterval: PREVIEW_FRAME_POLL_MS,
      refetchIntervalInBackground: false,
      staleTime: 0,
    },
  );
  if (last.current.uuid !== uuid) last.current = { uuid, frame: null };
  if (data) last.current.frame = data;
  return last.current.frame;
};
