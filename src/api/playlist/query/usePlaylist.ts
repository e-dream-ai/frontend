import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { Playlist } from "@/types/playlist.types";
import { axiosClient } from "@/client/axios.client";

export const PLAYLIST_QUERY_KEY = "getPlaylist";

type QueryFunctionParams = {
  uuid?: string;
};

const getPlaylist = ({ uuid }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/playlist/${uuid}`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

export const usePlaylist = (uuid?: string) => {
  const { user } = useAuth();
  return useQuery<ApiResponse<{ playlist: Playlist }>, Error>(
    [PLAYLIST_QUERY_KEY, uuid],
    getPlaylist({ uuid }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user) && Boolean(uuid),
    },
  );
};
