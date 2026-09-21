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
  search?: string;
  order?: "asc" | "desc";
  signal?: AbortSignal;
};

const getPlaylistItems = ({
  uuid,
  take,
  skip,
  search,
  order,
  signal,
}: QueryFunctionParams) => {
  return async () =>
    axiosClient
      .get<ApiResponse<{ items: PlaylistItem[]; totalCount: number }>>(
        `/v1/playlist/${uuid}/items`,
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
          throw new Error(res.data.message || "Could not load playlist items");
        }
        return res.data;
      });
};

type HookParams = {
  uuid?: string;
  search?: string;
  order?: "asc" | "desc";
};

export const fetchAllPlaylistItems = async (
  uuid: string,
): Promise<PlaylistItem[]> => {
  const res = await axiosClient.get<ApiResponse<{ items: PlaylistItem[] }>>(
    `/v1/playlist/${uuid}/playback-items`,
    { headers: getRequestHeaders({ contentType: ContentType.json }) },
  );
  return res.data?.data?.items ?? [];
};

export const usePlaylistItems = ({
  uuid,
  search = "",
  order = "asc",
}: HookParams) => {
  const { user } = useAuth();
  const take = PAGINATION.TAKE;

  return useInfiniteQuery<
    ApiResponse<{ items: PlaylistItem[]; totalCount: number }>,
    Error
  >(
    search || order !== "asc"
      ? [PLAYLIST_ITEMS_QUERY_KEY, uuid, { search, order }]
      : [PLAYLIST_ITEMS_QUERY_KEY, uuid],
    ({ pageParam = 0, signal }) =>
      getPlaylistItems({
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
        if (!lastPage.data?.items.length) return undefined;

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
