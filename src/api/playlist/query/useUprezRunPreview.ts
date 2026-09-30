import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import type { UprezRunSummary } from "@/types/playlist.types";
import { axiosClient } from "@/client/axios.client";

export const UPREZ_RUN_PREVIEW_QUERY_KEY = "getUprezRunPreview";

/** Unsaved settings to preview; omitted ones fall back to the saved prompt. */
export type UprezRunPreviewOverrides = {
  source_playlist_uuid?: string;
  params?: Record<string, number>;
};

type UprezRunPreviewOptions = {
  overrides?: UprezRunPreviewOverrides;
  enabled?: boolean;
  refreshKey?: string | number;
};

type UprezRunPreviewResponse = ApiResponse<{ result: UprezRunSummary }>;

const getUprezRunPreview =
  (uuid: string | undefined, overrides: UprezRunPreviewOverrides) =>
  async ({ signal }: QueryFunctionContext): Promise<UprezRunPreviewResponse> =>
    axiosClient
      .post(`/v1/playlist/${uuid}/run/preview`, overrides, {
        headers: getRequestHeaders({ contentType: ContentType.json }),
        signal,
      })
      .then((res) => res.data);

const selectResult = (response: UprezRunPreviewResponse) =>
  response.data?.result;

/** What running this uprez playlist would do. Changes nothing. */
export const useUprezRunPreview = (
  uuid: string | undefined,
  { overrides = {}, enabled = true, refreshKey }: UprezRunPreviewOptions = {},
) => {
  const { user } = useAuth();
  return useQuery<
    UprezRunPreviewResponse,
    AxiosError,
    UprezRunSummary | undefined
  >(
    [UPREZ_RUN_PREVIEW_QUERY_KEY, uuid, overrides, refreshKey],
    getUprezRunPreview(uuid, overrides),
    {
      select: selectResult,
      enabled: enabled && Boolean(user) && Boolean(uuid),
      retry: false,
      refetchOnWindowFocus: true,
    },
  );
};
