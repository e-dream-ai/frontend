import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import {
  FeedItem,
  FeedItemFilterType,
  RequestFeedItemType,
} from "@/types/feed.types";
import { axiosClient } from "@/client/axios.client";

export const FEED_QUERY_KEY = "getFeed";

type QueryFunctionParams = {
  take: number;
  skip: number;
  search?: string;
  userUUID?: string;
  type?: FeedItemFilterType;
  onlyHidden?: boolean;
};

const getFeed = ({
  take,
  skip,
  userUUID,
  search,
  type,
  onlyHidden,
}: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/feed`, {
        params: {
          take,
          skip,
          userUUID,
          search,
          type,
          onlyHidden,
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

type HookParams = {
  page?: number;
  userUUID?: string;
  search?: string;
  type?: FeedItemFilterType;
};

export function isRequestFeedItemType(
  value?: FeedItemFilterType,
): value is RequestFeedItemType {
  return value === "playlist" || value === "dream";
}

export const useFeed = ({ page = 0, userUUID, search, type }: HookParams) => {
  const { user } = useAuth();
  const take = PAGINATION.TAKE;
  const skip = page * take;
  // Don't send onlyHidden if is not needed
  const onlyHidden = type === "hidden" ? true : undefined;
  let feedItemType;
  if (isRequestFeedItemType(type)) {
    feedItemType = type;
  }

  return useQuery<ApiResponse<{ feed: FeedItem[]; count: number }>, Error>(
    [FEED_QUERY_KEY, page, search, type],
    getFeed({ take, skip, userUUID, search, type: feedItemType, onlyHidden }),
    {
      enabled: Boolean(user),
    },
  );
};
