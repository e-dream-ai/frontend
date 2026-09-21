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
  search?: string;
  order?: "asc" | "desc";
  signal?: AbortSignal;
};

const getPlaylistKeyframes = ({
  uuid,
  take,
  skip,
  search,
  order,
  signal,
}: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get<ApiResponse<{ keyframes: PlaylistKeyframe[]; totalCount: number }>>(
        `/v1/playlist/${uuid}/keyframes`,
        {
          params: {
            take,
            skip,
            search: search || undefined,
            order,
          },
          signal,
          headers: getRequestHeaders({
            contentType: ContentType.json,
          }),
        },
      )
      .then((res) => {
        if (!res.data.success || !res.data.data) {
          throw new Error(
            res.data.message || "Could not load playlist keyframes",
          );
        }
        return res.data;
      });
};

type HookParams = {
  uuid?: string;
  search?: string;
  order?: "asc" | "desc";
};

export const usePlaylistKeyframes = ({
  uuid,
  search = "",
  order = "asc",
}: HookParams) => {
  const { user } = useAuth();
  const take = PAGINATION.TAKE;

  return useInfiniteQuery<
    ApiResponse<{ keyframes: PlaylistKeyframe[]; totalCount: number }>,
    Error
  >(
    search || order !== "asc"
      ? [PLAYLIST_KEYFRAMES_QUERY_KEY, uuid, { search, order }]
      : [PLAYLIST_KEYFRAMES_QUERY_KEY, uuid],
    ({ pageParam = 0, signal }) =>
      getPlaylistKeyframes({
        uuid: uuid!,
        take,
        skip: pageParam * take,
        search,
        order,
        signal,
      })(),
    {
      enabled: Boolean(user) && Boolean(uuid),
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage.data?.keyframes.length) return undefined;

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
