import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

export const DREAM_QUERY_KEY = "getDream";

type QueryFunctionParams = {
  uuid?: string;
};

type HookOptions = {
  activeRefetchInterval?: boolean;
};

/**
 * Refetch dream info every 5 seconds
 */
const DREAM_REFETCH_INTERVAL = 5000;

const getDream = ({ uuid }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/dream/${uuid ?? ""}`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

export const useDream = (uuid?: string, options?: HookOptions) => {
  const { user } = useAuth();
  return useQuery<ApiResponse<{ dream: Dream }>, Error>(
    [DREAM_QUERY_KEY, { uuid }],
    getDream({ uuid }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user) && Boolean(uuid),
      refetchInterval: options?.activeRefetchInterval
        ? DREAM_REFETCH_INTERVAL
        : false,
    },
  );
};
