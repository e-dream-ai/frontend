import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import useAuth from "@/hooks/useAuth";

interface PlaylistSummary {
  uuid: string;
  name: string;
}

const USER_PLAYLISTS_KEY = "studioUserPlaylists";

const fetchUserPlaylists = async (
  userUuid: string,
): Promise<PlaylistSummary[]> => {
  const { data } = await axiosClient.get(
    `/v1/playlist?userUUID=${userUuid}&take=200&skip=0`,
  );
  return data.data.playlists.map((p: { uuid: string; name: string }) => ({
    uuid: p.uuid,
    name: p.name,
  }));
};

export const useUserPlaylists = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<PlaylistSummary[], Error>(
    [USER_PLAYLISTS_KEY, user?.uuid],
    () => fetchUserPlaylists(user!.uuid),
    { enabled: Boolean(user?.uuid) },
  );

  const addPlaylistToCache = (playlist: PlaylistSummary) => {
    queryClient.setQueryData<PlaylistSummary[]>(
      [USER_PLAYLISTS_KEY, user?.uuid],
      (old) => (old ? [playlist, ...old] : [playlist]),
    );
  };

  return { ...query, playlists: query.data ?? [], addPlaylistToCache };
};
