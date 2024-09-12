import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { Playlist } from "@/types/playlist.types";
import useApiQuery from "@/api/shared/useApiQuery";

export const PLAYLIST_QUERY_KEY = "getPlaylist";

type PlaylistResponse = {
  playlist?: Playlist;
};

export const usePlaylist = (uuid?: string) => {
  return useApiQuery<PlaylistResponse>(
    [PLAYLIST_QUERY_KEY, uuid],
    `/v1/playlist/${uuid ?? ""}`,
    {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    },
    {},
  );
};
