import { useInfiniteQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PlaylistKeyframe } from "@/types/playlist.types";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";

export const PLAYLIST_KEYFRAMES_QUERY_KEY = "getPlaylistKeyframes";

type QueryFunctionParams = {
  uuid: string;
  take: number;
  skip: number;
};

const getPlaylistKeyframes = ({ uuid, take, skip }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/playlist/${uuid}/keyframes`, {
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
  uuid?: string;
};

export const usePlaylistKeyframes = ({ uuid }: HookParams) => {
  const { user } = useAuth();
  const take = PAGINATION.TAKE;

  return useInfiniteQuery<
    ApiResponse<{ keyframes: PlaylistKeyframe[]; totalCount: number }>,
    Error
  >(
    [PLAYLIST_KEYFRAMES_QUERY_KEY, uuid],
    ({ pageParam = 0 }) =>
      getPlaylistKeyframes({
        uuid: uuid!,
        take,
        skip: pageParam * take,
      })(),
    {
      enabled: Boolean(user) && Boolean(uuid),
      getNextPageParam: (lastPage, allPages) => {
        const totalItems = lastPage.data?.totalCount ?? 0;
        const currentItemCount = allPages.reduce(
          (total, page) => total + (page?.data?.keyframes?.length ?? 0),
          0,
        );

        return currentItemCount < totalItems ? allPages.length : undefined;
      },
    },
  );
};
