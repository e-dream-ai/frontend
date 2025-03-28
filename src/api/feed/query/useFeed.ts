import { useInfiniteQuery } from "@tanstack/react-query";
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

export const useFeed = ({ search, userUUID, type }: HookParams) => {
  const { user } = useAuth();
  const take = PAGINATION.TAKE;
  // Don't send onlyHidden if is not needed
  const onlyHidden = type === "hidden" ? true : undefined;
  let feedItemType: FeedItemFilterType;
  if (isRequestFeedItemType(type)) {
    feedItemType = type;
  }

  return useInfiniteQuery<
    ApiResponse<{ feed: FeedItem[]; count: number }>,
    Error
  >(
    [FEED_QUERY_KEY, search, type, userUUID],
    ({ pageParam = 0 }) =>
      getFeed({
        take,
        skip: pageParam * take,
        userUUID,
        // If search is empty don't sent it
        search: search?.trim() || undefined,
        type: feedItemType,
        onlyHidden,
      })(),
    {
      enabled: Boolean(user),
      getNextPageParam: (lastPage, allPages) => {
        const totalItems = lastPage.data?.count ?? 0;
        const currentItemCount = allPages.reduce(
          (total, page) => total + (page?.data?.feed?.length ?? 0),
          0,
        );

        // Check if there are more items to load
        return currentItemCount < totalItems ? allPages.length : undefined;
      },
    },
  );
};
