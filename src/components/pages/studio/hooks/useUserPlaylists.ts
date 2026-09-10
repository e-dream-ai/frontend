import { useCallback } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import type { ApiResponse } from "@/types/api.types";
import { PLAYLISTS_QUERY_KEY } from "@/api/playlist/query/usePlaylists";
import useAuth from "@/hooks/useAuth";

export interface PlaylistSummary {
  uuid: string;
  name: string;
  /** Cover image for the picker grid. Empty when the playlist has no art. */
  thumbnail?: string | null;
  /**
   * Raw playlist prompt. Carried so callers can tell a plain playlist from a
   * derived uprez one (`parseUprezPlaylistPrompt`) without a second fetch.
   */
  prompt?: string | null;
}

const USER_PLAYLISTS_KEY = "studioUserPlaylists";

const EMPTY_PLAYLISTS: PlaylistSummary[] = [];
const PICKER_PAGE_SIZE = 20;

interface PlaylistPage {
  playlists: PlaylistSummary[];
  count: number;
  nextOffset: number | undefined;
}

const fetchPlaylistPage = async ({
  userUuid,
  take,
  skip = 0,
  search,
  signal,
}: {
  userUuid: string | undefined;
  take: number;
  skip?: number;
  search?: string;
  signal?: AbortSignal;
}): Promise<PlaylistPage> => {
  if (!userUuid) throw new Error("Sign in to load your playlists");

  const { data } = await axiosClient.get<
    ApiResponse<{ playlists: PlaylistSummary[]; count: number }>
  >("/v1/playlist", {
    params: { userUUID: userUuid, take, skip, search: search || undefined },
    signal,
  });
  if (!data.data) throw new Error("No playlists in response");

  const { playlists, count } = data.data;
  const nextOffset = skip + playlists.length;
  return {
    playlists,
    count,
    nextOffset:
      playlists.length > 0 && nextOffset < count ? nextOffset : undefined,
  };
};

export const useInfiniteUserPlaylists = (search: string) => {
  const { user } = useAuth();
  const userUuid = user?.uuid;

  return useInfiniteQuery<PlaylistPage, Error>(
    [USER_PLAYLISTS_KEY, userUuid, "infinite", search],
    ({ pageParam = 0, signal }) =>
      fetchPlaylistPage({
        userUuid,
        take: PICKER_PAGE_SIZE,
        skip: pageParam,
        search,
        signal,
      }),
    {
      enabled: Boolean(userUuid),
      staleTime: 30_000,
      getNextPageParam: (lastPage) => lastPage.nextOffset,
    },
  );
};

export const useAddPlaylistToCache = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userUuid = user?.uuid;

  const addPlaylistToCache = useCallback(
    async (playlist: PlaylistSummary) => {
      if (!userUuid) return;
      const queryKey = [USER_PLAYLISTS_KEY, userUuid];
      await queryClient.cancelQueries({ queryKey, exact: true });
      queryClient.setQueryData<PlaylistSummary[]>(queryKey, (old = []) => [
        playlist,
        ...old.filter((item) => item.uuid !== playlist.uuid),
      ]);
      void queryClient.invalidateQueries({ queryKey: [PLAYLISTS_QUERY_KEY] });
      void queryClient.invalidateQueries({
        queryKey: [USER_PLAYLISTS_KEY, userUuid, "infinite"],
      });
    },
    [queryClient, userUuid],
  );

  return addPlaylistToCache;
};

export const useUserPlaylists = () => {
  const { user } = useAuth();
  const userUuid = user?.uuid;
  const addPlaylistToCache = useAddPlaylistToCache();
  const query = useQuery<PlaylistSummary[], Error>(
    [USER_PLAYLISTS_KEY, userUuid],
    async ({ signal }) =>
      (await fetchPlaylistPage({ userUuid, take: 200, signal })).playlists,
    { enabled: Boolean(userUuid), staleTime: 30_000 },
  );

  return {
    ...query,
    playlists: query.data ?? EMPTY_PLAYLISTS,
    addPlaylistToCache,
  };
};
