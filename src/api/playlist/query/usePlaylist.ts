import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import useAuth from "hooks/useAuth";
import { ApiResponse } from "types/api.types";
import { Playlist } from "types/playlist.types";

export const PLAYLIST_QUERY_KEY = "getPlaylist";

type QueryFunctionParams = {
  id?: number;
};

const getPlaylist = ({ id }: QueryFunctionParams) => {
  return async () =>
    axios
      .get(`${URL}/playlist/${id ?? ""}`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

export const usePlaylist = (id?: number) => {
  const { user } = useAuth();
  return useQuery<ApiResponse<{ playlist: Playlist }>, Error>(
    [PLAYLIST_QUERY_KEY, id],
    getPlaylist({ id }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user) && Boolean(id),
    },
  );
};
