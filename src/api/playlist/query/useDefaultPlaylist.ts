import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useApiQuery from "@/api/shared/useApiQuery";
import { Dream } from "@/types/dream.types";

export const DEFAULT_PLAYLIST_QUERY_KEY = "getDefaultPlaylist";

type DefaultPlaylistResponse = { dreams: Dream[] };

export const useDefaultPlaylist = () => {
  return useApiQuery<DefaultPlaylistResponse>(
    [DEFAULT_PLAYLIST_QUERY_KEY],
    `/v1/playlist/default`,
    {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    },
    {},
  );
};
