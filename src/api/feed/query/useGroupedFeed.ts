import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
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
  // Track seen virtual playlists across all pages to prevent duplicates
  const seenVirtualPlaylistsRef = useRef(new Set<string>());

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
      select: (data) => {
        // Reset seen virtual playlists when query key changes (new search, etc.)
        // This happens when the query is refetched with different parameters
        if (data.pages.length === 1) {
          seenVirtualPlaylistsRef.current.clear();
        }

        // Only process pages that haven't been processed yet
        const processedPages = data.pages.map((page, pageIndex) => {
          if (!page.data) {
            return page;
          }

          // For the first page or when we have only one page, process all virtual playlists
          if (pageIndex === 0 || data.pages.length === 1) {
            // Mark all virtual playlists from first page as seen
            page.data.virtualPlaylists?.forEach((virtualPlaylist) => {
              seenVirtualPlaylistsRef.current.add(virtualPlaylist.uuid);
            });
            return page; // Return first page unchanged
          }

          // For subsequent pages, filter out duplicates
          const newVirtualPlaylists =
            page.data.virtualPlaylists?.filter((virtualPlaylist) => {
              if (seenVirtualPlaylistsRef.current.has(virtualPlaylist.uuid)) {
                return false; // Already seen, filter out
              }
              // Mark as seen and include
              seenVirtualPlaylistsRef.current.add(virtualPlaylist.uuid);
              return true;
            }) || [];

          return {
            ...page,
            data: {
              ...page.data,
              virtualPlaylists: newVirtualPlaylists,
            },
          };
        });

        return {
          ...data,
          pages: processedPages,
        };
      },
      getNextPageParam: (lastPage, allPages) => {
        const totalItems = lastPage.data?.count ?? 0;

        // Calculate current item count from deduplicated pages
        const currentItemCount = allPages.reduce(
          (total, page) =>
            total +
            (page?.data?.feedItems?.length ?? 0) +
            (page?.data?.virtualPlaylists?.length ?? 0),
          0,
        );

        const hasMore = currentItemCount < totalItems;
        const nextPage = hasMore ? allPages.length : undefined;

        // Check if there are more items to load
        return nextPage;
      },
    },
  );

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = queryResult;

  // Auto-fetch next page if current pages have no content after deduplication
  useEffect(() => {
    if (!data || isFetchingNextPage || !hasNextPage) {
      return;
    }

    // Check if the LATEST page has content after deduplication
    // If the latest page is empty, we should fetch more regardless of previous pages
    const lastPageIndex = data.pages.length - 1;
    const lastPage = data.pages[lastPageIndex];

    const lastPageFeedItems = lastPage?.data?.feedItems?.length ?? 0;
    const lastPageVirtualPlaylists =
      lastPage?.data?.virtualPlaylists?.length ?? 0;
    const lastPageHasContent =
      lastPageFeedItems > 0 || lastPageVirtualPlaylists > 0;

    // If the latest page has no content, fetch next page (React Query will handle sequential fetching)
    if (!lastPageHasContent) {
      fetchNextPage();
    }
  }, [data, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Background prefetching: Aggressively fetch next 2 pages when user gets close to the end
  useEffect(() => {
    if (!data || isFetchingNextPage || !hasNextPage) return;

    // Calculate total content we have
    const totalCurrentContent = data.pages.reduce(
      (total, page) =>
        total +
        (page.data?.feedItems?.length ?? 0) +
        (page.data?.virtualPlaylists?.length ?? 0),
      0,
    );

    if (totalCurrentContent < 40 && hasNextPage) {
      const prefetchTimer = setTimeout(() => {
        fetchNextPage().catch((error) => {
          console.warn("Background prefetch failed:", error);
        });
      }, 500);

      return () => clearTimeout(prefetchTimer);
    }
  }, [data, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return queryResult;
};
