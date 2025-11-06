import { useMutation } from "@tanstack/react-query";
import queryClient from "@/api/query-client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { OrderPlaylistFormValues } from "@/schemas/order-playlist.schema";
import { ApiResponse } from "@/types/api.types";
import { PLAYLIST_QUERY_KEY } from "../query/usePlaylist";
import { PLAYLIST_ITEMS_QUERY_KEY } from "@/api/playlist/query/usePlaylistItems";
import { PlaylistItem } from "@/types/playlist.types";
import { ItemOrder } from "@/types/dnd.types";
import { axiosClient } from "@/client/axios.client";

export const ORDER_PLAYLIST_MUTATION_KEY = "orderPlaylist";

export type OrderPlaylistMode = "optimistic" | "server-driven";

type PlaylistItemsQueryData = {
  pages: Array<{
    data?: { items: PlaylistItem[]; totalCount: number };
  }>;
  pageParams: unknown[];
};

type OrderPlaylistMutationContext = {
  itemsSnapshot?: PlaylistItemsQueryData;
};

type OrderPlaylistResponse = ApiResponse<{
  items: PlaylistItem[];
  totalCount: number;
}>;

const updateItemsOrderInCache = (
  oldData: PlaylistItemsQueryData | undefined,
  orderedItems: ItemOrder[],
): PlaylistItemsQueryData | undefined => {
  if (!oldData) return oldData;

  const idToOrder = new Map<number, number>(
    orderedItems.map((o) => [o.id, o.order]),
  );

  return {
    ...oldData,
    pages: oldData.pages.map((page) => {
      if (!page.data) return page;
      return {
        ...page,
        data: {
          ...page.data,
          items: page.data.items.map((item) => {
            const newOrder = idToOrder.get(item.id);
            return newOrder !== undefined ? { ...item, order: newOrder } : item;
          }),
        },
      };
    }),
  };
};

const orderPlaylist = () => {
  return async (
    data: OrderPlaylistFormValues & { mode?: OrderPlaylistMode },
  ) => {
    const { uuid, values } = data;
    return axiosClient
      .put(`/v1/playlist/${uuid}/order`, values, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useOrderPlaylist = (
  uuid?: string,
  mode: OrderPlaylistMode = "optimistic",
) => {
  return useMutation<
    ApiResponse<unknown>,
    Error,
    OrderPlaylistFormValues & { mode?: OrderPlaylistMode },
    OrderPlaylistMutationContext
  >(orderPlaylist(), {
    mutationKey: [ORDER_PLAYLIST_MUTATION_KEY],
    onMutate: async (variables) => {
      const actualMode = variables.mode || mode;
      const itemsSnapshot = queryClient.getQueryData<PlaylistItemsQueryData>([
        PLAYLIST_ITEMS_QUERY_KEY,
        uuid,
      ]);

      // Only optimistic updates for drag-and-drop mode
      if (actualMode === "optimistic") {
        const orderedItems = variables.values.order;
        queryClient.setQueryData<PlaylistItemsQueryData>(
          [PLAYLIST_ITEMS_QUERY_KEY, uuid],
          (oldData) => updateItemsOrderInCache(oldData, orderedItems),
        );
      }

      return { itemsSnapshot };
    },
    onSuccess: async (data, variables) => {
      const actualMode = variables.mode || mode;

      if (actualMode === "server-driven") {
        const responseData = data as OrderPlaylistResponse;
        const serverItems = responseData?.data?.items;
        const totalCount = responseData?.data?.totalCount;

        if (serverItems && serverItems.length) {
          queryClient.setQueryData<PlaylistItemsQueryData>(
            [PLAYLIST_ITEMS_QUERY_KEY, uuid],
            {
              pages: [
                {
                  data: {
                    items: serverItems,
                    totalCount: totalCount ?? serverItems.length,
                  },
                },
              ],
              pageParams: [0],
            },
          );
        } else {
          const orderedItems = variables.values.order;
          queryClient.setQueryData<PlaylistItemsQueryData>(
            [PLAYLIST_ITEMS_QUERY_KEY, uuid],
            (oldData) => updateItemsOrderInCache(oldData, orderedItems),
          );
        }
        queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, uuid]);
      }
    },
    onError: (_, __, context) => {
      if (context?.itemsSnapshot) {
        queryClient.setQueryData(
          [PLAYLIST_ITEMS_QUERY_KEY, uuid],
          context.itemsSnapshot,
        );
      }
    },
  });
};
