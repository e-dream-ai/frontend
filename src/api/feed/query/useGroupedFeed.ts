import { useInfiniteQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import {
  FeedItem,
  FeedItemFilterType,
  RequestFeedItemType,
  VirtualPlaylist,
} from "@/types/feed.types";
import { axiosClient } from "@/client/axios.client";
import { useRef } from "react";

export const GROUPED_FEED_QUERY_KEY = "getGroupedFeed";

type QueryFunctionParams = {
  take: number;
  skip: number;
  search?: string;
  userUUID?: string;
  type?: FeedItemFilterType;
  onlyHidden?: boolean;
  excludedPlaylistUUIDs?: string;
};

type GroupedFeedResponse = {
  feedItems: FeedItem[];
  virtualPlaylists: VirtualPlaylist[];
  count: number;
};

const getGroupedFeed = ({
  take,
  skip,
  userUUID,
  search,
  type,
  onlyHidden,
  excludedPlaylistUUIDs,
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
          excludedPlaylistUUIDs,
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

export const useGroupedFeed = ({ search, userUUID, type }: HookParams) => {
  const { user } = useAuth();
  const take = PAGINATION.TAKE;
  // Don't send onlyHidden if is not needed
  const onlyHidden = type === "hidden" ? true : undefined;
  let feedItemType: FeedItemFilterType;
  if (isRequestFeedItemType(type)) {
    feedItemType = type;
  }

  const seenPlaylistUUIDs = useRef<Set<string>>(new Set());

  const query = useInfiniteQuery<ApiResponse<GroupedFeedResponse>, Error>(
    [GROUPED_FEED_QUERY_KEY, search, type, userUUID],
    ({ pageParam = 0 }) => {
      const excludedPlaylistUUIDs =
        seenPlaylistUUIDs.current.size > 0
          ? Array.from(seenPlaylistUUIDs.current).join(",")
          : undefined;

      return getGroupedFeed({
        take,
        skip: pageParam * take,
        userUUID,
        // If search is empty don't sent it
        search: search?.trim() || undefined,
        type: feedItemType,
        onlyHidden,
        excludedPlaylistUUIDs,
      })();
    },
    {
      enabled: Boolean(user),
      getNextPageParam: (lastPage, allPages) => {
        const totalItems = lastPage.data?.count ?? 0;
        const currentItemCount = allPages.reduce(
          (total, page) =>
            total +
            (page?.data?.feedItems?.length ?? 0) +
            (page?.data?.virtualPlaylists?.length ?? 0),
          0,
        );

        // Check if there are more items to load
        return currentItemCount < totalItems ? allPages.length : undefined;
      },
      onSuccess: (data) => {
        data.pages.forEach((page) => {
          page?.data?.virtualPlaylists?.forEach((playlist) => {
            seenPlaylistUUIDs.current.add(playlist.uuid);
          });
        });
      },
    },
  );

  // Reset seen playlists when search parameters change
  const queryKey = [GROUPED_FEED_QUERY_KEY, search, type, userUUID].join("|");
  const previousQueryKey = useRef<string>(queryKey);

  if (previousQueryKey.current !== queryKey) {
    seenPlaylistUUIDs.current.clear();
    previousQueryKey.current = queryKey;
  }

  return query;
};
