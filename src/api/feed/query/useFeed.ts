import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { PAGINATION } from "constants/pagination.constants";
import useAuth from "hooks/useAuth";
import { ApiResponse } from "types/api.types";
import { FeedItem } from "types/feed.types";

export const FEED_QUERY_KEY = "getFeed";

type QueryFunctionParams = {
  take: number;
  skip: number;
  userId?: number;
};

const getFeed = ({ take, skip, userId }: QueryFunctionParams) => {
  return async () =>
    axios
      .get(`${URL}/feed`, {
        params: {
          take,
          skip,
          userId,
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
};

export const useFeed = ({ page = 0, userId }: HookParams) => {
  const take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ feed: FeedItem[]; count: number }>, Error>(
    [FEED_QUERY_KEY, page],
    getFeed({ take, skip, userId }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user),
    },
  );
};
