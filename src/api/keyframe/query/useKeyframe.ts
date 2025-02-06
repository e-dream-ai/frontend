import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { Keyframe } from "@/types/keyframe.types";
import useApiQuery from "@/api/shared/useApiQuery";
import queryClient from "@/api/query-client";
import { axiosClient } from "@/client/axios.client";
import { ApiResponse } from "@/types/api.types";

export const KEYFRAME_QUERY_KEY = "getKeyframe";

type HookOptions = {
  activeRefetchInterval?: boolean;
};

/**
 * Refetch keyframe info every 5 seconds
 */

type KeyframeResponse = {
  keyframe?: Keyframe;
};

export const fetchKeyframe = async (uuid?: string) => {
  const data = await queryClient.fetchQuery<
    ApiResponse<{ keyframe: Keyframe }>
  >({
    queryKey: [KEYFRAME_QUERY_KEY, uuid],
    queryFn: () =>
      axiosClient
        .get(`/v1/keyframe/${uuid ?? ""}`, {
          headers: getRequestHeaders({
            contentType: ContentType.json,
          }),
        })
        .then((res) => {
          return res.data;
        }),
  });

  return data?.data?.keyframe;
};

export const useKeyframe = (uuid?: string, options?: HookOptions) => {
  return useApiQuery<KeyframeResponse>(
    [KEYFRAME_QUERY_KEY, uuid],
    `/v1/keyframe/${uuid ?? ""}`,
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
