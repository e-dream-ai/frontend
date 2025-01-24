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

export const fetchDream = async (uuid?: string) => {
  const data = await queryClient.fetchQuery<ApiResponse<{ dream: Dream }>>({
    queryKey: [DREAM_QUERY_KEY, uuid],
    queryFn: () =>
      axiosClient
        .get(`/v1/dream/${uuid ?? ""}`, {
          headers: getRequestHeaders({
            contentType: ContentType.json,
          }),
        })
        .then((res) => {
          return res.data;
        }),
  });

  return data?.data?.dream;
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
