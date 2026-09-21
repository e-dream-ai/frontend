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
      .put<ApiResponse<unknown>>(`/v1/playlist/${uuid}/order`, values, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        if (!res.data.success) {
          throw new Error(
            res.data.message || "Could not reorder playlist items",
          );
        }
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
    mutationKey: [ORDER_PLAYLIST_MUTATION_KEY, uuid],
    onMutate: async (variables) => {
      const actualMode = variables.mode ?? mode;
      if (actualMode !== "optimistic") return {};

      const queryKey = [PLAYLIST_ITEMS_QUERY_KEY, variables.uuid];
      await queryClient.cancelQueries({ queryKey });
      const itemsSnapshot =
        queryClient.getQueryData<PlaylistItemsQueryData>(queryKey);

      queryClient.setQueryData<PlaylistItemsQueryData>(queryKey, (oldData) =>
        updateItemsOrderInCache(oldData, variables.values.order),
      );

      return { itemsSnapshot };
    },
    onError: (_, variables, context) => {
      if (context?.itemsSnapshot) {
        queryClient.setQueryData(
          [PLAYLIST_ITEMS_QUERY_KEY, variables.uuid],
          context.itemsSnapshot,
        );
      }
    },
    onSettled: (_data, _error, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [PLAYLIST_ITEMS_QUERY_KEY, variables.uuid],
        }),
        queryClient.invalidateQueries({
          queryKey: [PLAYLIST_QUERY_KEY, variables.uuid],
        }),
      ]),
  });
};
