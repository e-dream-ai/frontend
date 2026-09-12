import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { Dream } from "@/types/dream.types";
import useApiQuery from "@/api/shared/useApiQuery";
import queryClient from "@/api/query-client";
import { axiosClient } from "@/client/axios.client";
import { ApiResponse } from "@/types/api.types";

export const DREAM_QUERY_KEY = "getDream";

type HookOptions = {
  activeRefetchInterval?: boolean;
};

/**
 * Refetch dream info every 5 seconds
 */

type DreamResponse = {
  dream?: Dream;
};

export const getDreamResponse = async (uuid: string, signal?: AbortSignal) => {
  const res = await axiosClient.get<ApiResponse<{ dream: Dream }>>(
    `/v1/dream/${uuid}`,
    { headers: getRequestHeaders({ contentType: ContentType.json }), signal },
  );
  return res.data;
};

export const getDream = async (uuid: string, signal?: AbortSignal) =>
  (await getDreamResponse(uuid, signal)).data?.dream;

export const fetchDream = async (uuid?: string) => {
  if (!uuid) return;
  const response = await queryClient.fetchQuery({
    queryKey: [DREAM_QUERY_KEY, uuid],
    queryFn: ({ signal }) => getDreamResponse(uuid, signal),
  });
  return response.data?.dream;
};

export const useDream = (uuid?: string, options?: HookOptions) => {
  return useApiQuery<DreamResponse>(
    [DREAM_QUERY_KEY, uuid],
    `/v1/dream/${uuid ?? ""}`,
    {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    },
    {
      activeRefetchInterval: options?.activeRefetchInterval,
    },
  );
};
