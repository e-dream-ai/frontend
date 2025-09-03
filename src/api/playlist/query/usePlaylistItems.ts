import { useInfiniteQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { PlaylistItem } from "@/types/playlist.types";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { PAGINATION } from "@/constants/pagination.constants";
import useAuth from "@/hooks/useAuth";

export const PLAYLIST_ITEMS_QUERY_KEY = "getPlaylistItems";

type QueryFunctionParams = {
  uuid: string;
  take: number;
  skip: number;
};

const getPlaylistItems = ({ uuid, take, skip }: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get(`/v1/playlist/${uuid}/items`, {
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

export const usePlaylistItems = ({ uuid }: HookParams) => {
  const { user } = useAuth();
  const take = PAGINATION.TAKE;

  return useInfiniteQuery<
    ApiResponse<{ items: PlaylistItem[]; totalCount: number }>,
    Error
  >(
    [PLAYLIST_ITEMS_QUERY_KEY, uuid],
    ({ pageParam = 0 }) =>
      getPlaylistItems({
        uuid: uuid!,
        take,
        skip: pageParam * take,
      })(),
    {
      enabled: Boolean(user) && Boolean(uuid),
      getNextPageParam: (lastPage, allPages) => {
        const totalItems = lastPage.data?.totalCount ?? 0;
        const currentItemCount = allPages.reduce(
          (total, page) => total + (page?.data?.items?.length ?? 0),
          0,
        );

        // Check if there are more items to load
        return currentItemCount < totalItems ? allPages.length : undefined;
      },
    },
  );
};
