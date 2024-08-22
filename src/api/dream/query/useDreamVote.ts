import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { Vote } from "@/types/vote.types";
import useApiQuery from "@/api/shared/useApiQuery";

export const DREAM_VOTE_QUERY_KEY = "getDreamVote";

type HookOptions = {
  activeRefetchInterval?: boolean;
};

type VoteResponse = { vote: Vote };

export const useDreamVote = (uuid?: string, options?: HookOptions) => {
  return useApiQuery<VoteResponse>(
    [DREAM_VOTE_QUERY_KEY, { uuid }],
    `/dream/${uuid ?? ""}/vote`,
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
