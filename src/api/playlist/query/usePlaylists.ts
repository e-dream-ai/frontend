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
  userUUID?: string;
  search?: string;
};

const getPlaylists = ({
  take,
  skip,
  userUUID,
  search,
}: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/playlist`, {
        params: {
          take,
          skip,
          userUUID,
          search,
        },
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

type PlaylistHookScope = "user-only" | "all-on-search";

type HookParams = {
  page?: number;
  search?: string;
  scope?: PlaylistHookScope;
};

export const usePlaylists = ({
  page = 0,
  search,
  scope = "user-only",
}: HookParams) => {
  const take = PAGINATION.TAKE;
  const skip = page * take;
  const { user } = useAuth();

  // Determine if we should include userUUID based on the option
  let userUUID: string | undefined;
  if (scope === "user-only") {
    userUUID = user?.uuid;
  } else if (scope === "all-on-search" && !search) {
    userUUID = user?.uuid;
  }

  return useQuery<ApiResponse<{ playlists: Playlist[]; count: number }>, Error>(
    [PLAYLISTS_QUERY_KEY, userUUID, page, search, take],
    getPlaylists({ take, skip, userUUID, search }),
    {
      enabled: Boolean(user),
    },
  );
};
