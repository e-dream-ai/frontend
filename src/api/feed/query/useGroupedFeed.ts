import { useInfiniteQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { FeedItemFilterType, RequestFeedItemType } from "@/types/feed.types";
import { axiosClient } from "@/client/axios.client";
import {
  dedupeGroupedFeedPages,
  getGroupedFeedNextPageParam,
  GroupedFeedResponse,
} from "@/helpers/groupedFeed.helpers";

export const GROUPED_FEED_QUERY_KEY = "getGroupedFeed";

type QueryFunctionParams = {
  take: number;
  skip: number;
  search?: string;
  userUUID?: string;
  type?: FeedItemFilterType;
  onlyHidden?: boolean;
  mediaType?: "image" | "video";
};

const getGroupedFeed = ({
  take,
  skip,
  userUUID,
  search,
  type,
  onlyHidden,
  mediaType,
}: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/feed/grouped`, {
        params: {
          take,
          skip,
          userUUID,
          search,
          type,
          onlyHidden,
          mediaType,
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
  mediaType?: "image" | "video";
};

export function isRequestFeedItemType(
  value?: FeedItemFilterType,
): value is RequestFeedItemType {
  return value === "playlist" || value === "dream";
}

export const useGroupedFeed = ({
  search,
  userUUID,
  type,
  mediaType,
}: HookParams) => {
  const { user } = useAuth();
  // Increase take size for grouped feed to reduce API calls due to deduplication
  const take = PAGINATION.TAKE * 2;

  // Don't send onlyHidden if is not needed
  const onlyHidden = type === "hidden" ? true : undefined;
  const feedItemType: FeedItemFilterType | undefined = isRequestFeedItemType(
    type,
  )
    ? type
    : undefined;

  const queryResult = useInfiniteQuery<ApiResponse<GroupedFeedResponse>, Error>(
    [GROUPED_FEED_QUERY_KEY, search, type, userUUID, mediaType],
    ({ pageParam = 0 }) => {
      return getGroupedFeed({
        take,
        skip: pageParam * take,
        userUUID,
        // If search is empty don't sent it
        search: search?.trim() || undefined,
        type: feedItemType,
        onlyHidden,
        mediaType,
      })();
    },
    {
      enabled: Boolean(user),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      select: dedupeGroupedFeedPages,
      getNextPageParam: (lastPage, allPages) =>
        getGroupedFeedNextPageParam(lastPage, allPages, take),
    },
  );

  return queryResult;
};
