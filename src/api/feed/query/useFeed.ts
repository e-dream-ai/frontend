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
};

const getFeed = ({ take, skip }: QueryFunctionParams) => {
  return async () =>
    axios
      .get(`${URL}/feed`, {
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

export const useFeed = ({ page = 0 }: HookParams) => {
  const take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ feed: FeedItem[]; count: number }>, Error>(
    [FEED_QUERY_KEY, page],
    getFeed({ take, skip }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user),
    },
  );
};
