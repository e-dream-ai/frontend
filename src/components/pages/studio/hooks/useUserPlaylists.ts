import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
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

const fetchUserPlaylists = async (
  userUuid: string,
): Promise<PlaylistSummary[]> => {
  const { data } = await axiosClient.get(
    `/v1/playlist?userUUID=${userUuid}&take=200&skip=0`,
  );
  return data.data.playlists.map(
    (p: {
      uuid: string;
      name: string;
      thumbnail?: string | null;
      prompt?: string | null;
    }) => ({
      uuid: p.uuid,
      name: p.name,
      thumbnail: p.thumbnail ?? null,
      prompt: p.prompt ?? null,
    }),
  );
};

export const useUserPlaylists = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<PlaylistSummary[], Error>(
    [USER_PLAYLISTS_KEY, user?.uuid],
    () => fetchUserPlaylists(user!.uuid),
    { enabled: Boolean(user?.uuid) },
  );

  const addPlaylistToCache = useCallback(
    (playlist: PlaylistSummary) => {
      queryClient.setQueryData<PlaylistSummary[]>(
        [USER_PLAYLISTS_KEY, user?.uuid],
        (old) => (old ? [playlist, ...old] : [playlist]),
      );
    },
    [queryClient, user?.uuid],
  );

  return { ...query, playlists: query.data ?? [], addPlaylistToCache };
};
