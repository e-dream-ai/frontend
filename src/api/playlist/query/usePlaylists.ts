import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { Playlist } from "@/types/playlist.types";
import { axiosClient } from "@/client/axios.client";

export const PLAYLISTS_QUERY_KEY = "getPlaylists";

type QueryFunctionParams = {
  take: number;
  skip: number;
};

const getPlaylists = ({ take, skip }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/playlist`, {
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

export const usePlaylists = ({ page = 0 }: HookParams) => {
  const take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();
  return useQuery<ApiResponse<{ playlists: Playlist[]; count: number }>, Error>(
    [PLAYLISTS_QUERY_KEY, page],
    getPlaylists({ take, skip }),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user),
    },
  );
};
