import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { Vote } from "@/types/vote.types";

export const DREAM_VOTE_QUERY_KEY = "getDreamVote";

type QueryFunctionParams = {
  uuid?: string;
};

type HookOptions = {
  activeRefetchInterval?: boolean;
};

/**
 * Refetch dream vote every 5 seconds
 */
const VOTE_REFETCH_INTERVAL = 5000;

const getDreamVote = ({ uuid }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/dream/${uuid ?? ""}/vote`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

export const useDreamVote = (uuid?: string, options?: HookOptions) => {
  const { user } = useAuth();
  return useQuery<ApiResponse<{ vote: Vote }>, Error>(
    [DREAM_VOTE_QUERY_KEY, { uuid }],
    getDreamVote({ uuid }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user) && Boolean(uuid),
      refetchInterval: options?.activeRefetchInterval
        ? VOTE_REFETCH_INTERVAL
        : false,
    },
  );
};
