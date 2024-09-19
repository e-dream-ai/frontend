import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { FeedItem, FeedItemServerType } from "@/types/feed.types";
import { axiosClient } from "@/client/axios.client";

export const FEED_QUERY_KEY = "getFeed";

type QueryFunctionParams = {
  take: number;
  skip: number;
  search?: string;
  userId?: number;
  type?: FeedItemServerType;
};

const getFeed = ({ take, skip, userId, search, type }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/feed`, {
        params: {
          take,
          skip,
          userId,
          search,
          type,
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

type HookParams = {
  page?: number;
  userId?: number;
  search?: string;
  type?: FeedItemServerType;
};

export const useFeed = ({ page = 0, userId, search, type }: HookParams) => {
  const take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ feed: FeedItem[]; count: number }>, Error>(
    [FEED_QUERY_KEY, page, search, type],
    getFeed({ take, skip, userId, search, type }),
    {
      enabled: Boolean(user),
    },
  );
};
