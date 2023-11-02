import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { PAGINATION } from "constants/pagination.constants";
import useAuth from "hooks/useAuth";
import { ApiResponse } from "types/api.types";
import { Playlist } from "types/playlist.types";

export const MY_PLAYLISTS_QUERY_KEY = "getMyPlaylists";

type QueryFunctionParams = {
  take: number;
  skip: number;
};

const getPlaylists = ({ take, skip }: QueryFunctionParams) => {
  return async () =>
    axios
      .get(`${URL}/playlist/my-playlists`, {
        params: {
          take,
          skip,
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

type HookParams = {
  page?: number;
};

export const useMyPlaylists = ({ page = 0 }: HookParams) => {
  const take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ playlists: Playlist[]; count: number }>, Error>(
    [MY_PLAYLISTS_QUERY_KEY, page],
    getPlaylists({ take, skip }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user),
    },
  );
};
