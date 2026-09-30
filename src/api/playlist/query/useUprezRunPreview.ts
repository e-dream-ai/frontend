import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import type { RunPlaylistResult } from "../mutation/useRunPlaylist";

export const UPREZ_RUN_PREVIEW_QUERY_KEY = "getUprezRunPreview";

/** Unsaved settings to preview; omitted ones fall back to the saved prompt. */
export type UprezRunPreviewOverrides = {
  source_playlist_uuid?: string;
  params?: Record<string, number>;
};

const getUprezRunPreview =
  (uuid: string | undefined, overrides: UprezRunPreviewOverrides) => async () =>
    axiosClient
      .post(`/v1/playlist/${uuid}/run/preview`, overrides, {
        headers: getRequestHeaders({ contentType: ContentType.json }),
      })
      .then((res) => res.data);

/** What running this uprez playlist would do. Changes nothing. */
export const useUprezRunPreview = (
  uuid: string | undefined,
  overrides: UprezRunPreviewOverrides = {},
  enabled = true,
) => {
  const { user } = useAuth();
  return useQuery<ApiResponse<{ result: RunPlaylistResult }>, Error>(
    [UPREZ_RUN_PREVIEW_QUERY_KEY, uuid, overrides],
    getUprezRunPreview(uuid, overrides),
    {
      enabled: enabled && Boolean(user) && Boolean(uuid),
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  );
};
