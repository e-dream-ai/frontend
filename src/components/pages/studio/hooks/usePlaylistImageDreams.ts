import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { Dream, DreamMediaType } from "@/types/dream.types";
import { PlaylistItem } from "@/types/playlist.types";

export const PLAYLIST_IMAGE_DREAMS_QUERY_KEY = "studioPlaylistImageDreams";

const TAKE = 100;

const isImageDream = (dream?: Dream): dream is Dream =>
  !!dream?.thumbnail &&
  (!dream.mediaType || dream.mediaType === DreamMediaType.IMAGE);

const fetchPage = (uuid: string, skip: number, signal?: AbortSignal) =>
  axiosClient
    .get<ApiResponse<{ items: PlaylistItem[]; totalCount: number }>>(
      `/v1/playlist/${uuid}/items`,
      {
        params: { take: TAKE, skip },
        headers: getRequestHeaders({ contentType: ContentType.json }),
        signal,
      },
    )
    .then((res) => res.data);

export const usePlaylistImageDreams = (playlistUuid: string) => {
  const { user } = useAuth();

  const {
    data,
    isInitialLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<
    ApiResponse<{ items: PlaylistItem[]; totalCount: number }>,
    Error
  >(
    [PLAYLIST_IMAGE_DREAMS_QUERY_KEY, playlistUuid],
    ({ pageParam = 0, signal }) =>
      fetchPage(playlistUuid, pageParam * TAKE, signal),
    {
      enabled: Boolean(user) && Boolean(playlistUuid),
      staleTime: 30_000,
      getNextPageParam: (lastPage, allPages) => {
        const total = lastPage.data?.totalCount ?? 0;
        const loaded = allPages.reduce(
          (sum, page) => sum + (page.data?.items?.length ?? 0),
          0,
        );
        return loaded < total ? allPages.length : undefined;
      },
    },
  );

  const dreams = useMemo(
    () =>
      data?.pages
        .flatMap((page) => page.data?.items ?? [])
        .map((item) => item.dreamItem)
        .filter(isImageDream) ?? [],
    [data],
  );

  return {
    dreams,
    isLoading: isInitialLoading,
    isError,
    hasMore: hasNextPage ?? false,
    fetchNextPage,
    isFetchingNextPage,
  };
};
