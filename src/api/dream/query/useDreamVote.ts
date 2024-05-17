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

export const useDreamVote = (uuid?: string) => {
  const { user } = useAuth();
  return useQuery<ApiResponse<{ vote: Vote }>, Error>(
    [DREAM_VOTE_QUERY_KEY, { uuid }],
    getDreamVote({ uuid }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user) && Boolean(uuid),
    },
  );
};
