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
  userId?: number;
  search?: string;
};

const getPlaylists = ({ take, skip, userId, search }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/playlist`, {
        params: {
          take,
          skip,
          userId,
          search,
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

type HookParams = {
  page?: number;
  search?: string;
};

export const usePlaylists = ({ page = 0, search }: HookParams) => {
  const take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery<ApiResponse<{ playlists: Playlist[]; count: number }>, Error>(
    [PLAYLISTS_QUERY_KEY, userId, page, search, take],
    getPlaylists({ take, skip, userId, search }),
    {
      enabled: Boolean(user),
    },
  );
};
