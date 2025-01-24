import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { Playlist } from "@/types/playlist.types";
import useApiQuery from "@/api/shared/useApiQuery";
import queryClient from "@/api/query-client";
import { axiosClient } from "@/client/axios.client";
import { ApiResponse } from "@/types/api.types";

export const PLAYLIST_QUERY_KEY = "getPlaylist";

type PlaylistResponse = {
  playlist?: Playlist;
};

export const fetchPlaylist = async (uuid?: string) => {
  const data = await queryClient.fetchQuery<
    ApiResponse<{ playlist: Playlist }>
  >({
    queryKey: [PLAYLIST_QUERY_KEY, uuid],
    queryFn: () =>
      axiosClient
        .get(`/v1/dream/${uuid ?? ""}`, {
          headers: getRequestHeaders({
            contentType: ContentType.json,
          }),
        })
        .then((res) => {
          return res.data;
        }),
  });

  return data?.data?.playlist;
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
