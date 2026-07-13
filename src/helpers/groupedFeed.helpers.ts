import { InfiniteData } from "@tanstack/react-query";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { FeedItem, VirtualPlaylist } from "@/types/feed.types";

export type GroupedFeedResponse = {
  feedItems: FeedItem[];
  virtualPlaylists: VirtualPlaylist[];
  count: number;
};

type GroupedFeedPage = ApiResponse<GroupedFeedResponse>;
type GroupedFeedData = InfiniteData<GroupedFeedPage>;

export const getGroupedFeedNextPageParam = (
  lastPage: GroupedFeedPage,
  allPages: GroupedFeedPage[],
  take: number,
): number | undefined => {
  const totalRawItems = lastPage.data?.count ?? 0;
  const loadedRawItems = allPages.length * take;

  return loadedRawItems < totalRawItems ? allPages.length : undefined;
};

export const dedupeGroupedFeedPages = (
  data: GroupedFeedData,
): GroupedFeedData => {
  const firstPageForPlaylist = new Map<string, number>();
  const mergedDreamsForPlaylist = new Map<string, Dream[]>();
  const seenDreamsForPlaylist = new Map<string, Set<string>>();

  data.pages.forEach((page, pageIndex) => {
    page.data?.virtualPlaylists?.forEach((virtualPlaylist) => {
      if (!firstPageForPlaylist.has(virtualPlaylist.uuid)) {
        firstPageForPlaylist.set(virtualPlaylist.uuid, pageIndex);
        mergedDreamsForPlaylist.set(virtualPlaylist.uuid, []);
        seenDreamsForPlaylist.set(virtualPlaylist.uuid, new Set());
      }

      const dreams = mergedDreamsForPlaylist.get(virtualPlaylist.uuid)!;
      const seenDreams = seenDreamsForPlaylist.get(virtualPlaylist.uuid)!;
      virtualPlaylist.dreams?.forEach((dream) => {
        if (!seenDreams.has(dream.uuid)) {
          seenDreams.add(dream.uuid);
          dreams.push(dream);
        }
      });
    });
  });

  const processedPages = data.pages.map((page, pageIndex) => {
    if (!page.data) {
      return page;
    }

    const virtualPlaylists = (page.data.virtualPlaylists ?? [])
      .filter(
        (virtualPlaylist) =>
          firstPageForPlaylist.get(virtualPlaylist.uuid) === pageIndex,
      )
      .map((virtualPlaylist) => ({
        ...virtualPlaylist,
        dreams:
          mergedDreamsForPlaylist.get(virtualPlaylist.uuid) ??
          virtualPlaylist.dreams,
      }));

    return {
      ...page,
      data: {
        ...page.data,
        virtualPlaylists,
      },
    };
  });

  return {
    ...data,
    pages: processedPages,
  };
};
