import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import type { EnhanceRunSummary } from "@/types/playlist.types";
import { axiosClient } from "@/client/axios.client";

export const ENHANCE_RUN_PREVIEW_QUERY_KEY = "getEnhanceRunPreview";

/** Unsaved settings to preview; omitted ones fall back to the saved prompt. */
export type EnhanceRunPreviewOverrides = {
  source_playlist_uuid?: string;
  params?: Record<string, number>;
};

type EnhanceRunPreviewOptions = {
  overrides?: EnhanceRunPreviewOverrides;
  enabled?: boolean;
  refreshKey?: string | number;
};

type EnhanceRunPreviewResponse = ApiResponse<{ result: EnhanceRunSummary }>;

const getEnhanceRunPreview =
  (uuid: string | undefined, overrides: EnhanceRunPreviewOverrides) =>
  async ({
    signal,
  }: QueryFunctionContext): Promise<EnhanceRunPreviewResponse> =>
    axiosClient
      .post(`/v1/playlist/${uuid}/run/preview`, overrides, {
        headers: getRequestHeaders({ contentType: ContentType.json }),
        signal,
      })
      .then((res) => res.data);

const selectResult = (response: EnhanceRunPreviewResponse) =>
  response.data?.result;

/** What running this enhance playlist would do. Changes nothing. */
export const useEnhanceRunPreview = (
  uuid: string | undefined,
  { overrides = {}, enabled = true, refreshKey }: EnhanceRunPreviewOptions = {},
) => {
  const { user } = useAuth();
  return useQuery<
    EnhanceRunPreviewResponse,
    AxiosError,
    EnhanceRunSummary | undefined
  >(
    [ENHANCE_RUN_PREVIEW_QUERY_KEY, uuid, overrides, refreshKey],
    getEnhanceRunPreview(uuid, overrides),
    {
      select: selectResult,
      enabled: enabled && Boolean(user) && Boolean(uuid),
      retry: false,
      refetchOnWindowFocus: true,
    },
  );
};
