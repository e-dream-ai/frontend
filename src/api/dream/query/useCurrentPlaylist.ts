import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { Playlist } from "@/types/playlist.types";

export const CURRENT_PLAYLIST_QUERY_KEY = "getCurrentPlaylist";

const getCurrentPlaylist = async () => {
  return axiosClient
    .get(`/v2/auth/playlist/current`, {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    })
    .then((res) => {
      return res.data;
    });
};

export const useCurrentPlaylist = () => {
  return useQuery<ApiResponse<{ playlist: Playlist }>, Error>(
    [CURRENT_PLAYLIST_QUERY_KEY],
    getCurrentPlaylist,
  );
};

export default useCurrentPlaylist;
