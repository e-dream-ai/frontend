import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { FeedItem } from "@/types/feed.types";
import { axiosClient } from "@/client/axios.client";

export const FEED_MY_DREAMS_QUERY_KEY = "getFeedMyDreams";

type QueryFunctionParams = {
  take: number;
  skip: number;
};

const getFeedMyDreams = ({ take, skip }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/feed/my-dreams`, {
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

export const useFeedMyDreams = ({ page = 0 }: HookParams) => {
  const take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ feed: FeedItem[]; count: number }>, Error>(
    [FEED_MY_DREAMS_QUERY_KEY, page],
    getFeedMyDreams({ take, skip }),
    {
      enabled: Boolean(user),
    },
  );
};
