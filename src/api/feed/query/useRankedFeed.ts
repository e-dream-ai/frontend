import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { FeedItem } from "@/types/feed.types";
import { axiosClient } from "@/client/axios.client";

export const RANKED_FEED_QUERY_KEY = "getRankedFeed";

type QueryFunctionParams = {
  take: number;
  skip: number;
};

const getRankedFeed = ({ take, skip }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/feed/ranked`, {
        params: {
          take,
          skip,
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

type HookParams = {
  page?: number;
};

export const useRankedFeed = ({ page = 0 }: HookParams) => {
  const take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ feed: FeedItem[]; count: number }>, Error>(
    [RANKED_FEED_QUERY_KEY, page],
    getRankedFeed({ take, skip }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user),
    },
  );
};
