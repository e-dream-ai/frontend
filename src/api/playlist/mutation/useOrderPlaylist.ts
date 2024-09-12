import { useMutation } from "@tanstack/react-query";
import queryClient from "@/api/query-client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { OrderPlaylistFormValues } from "@/schemas/order-playlist.schema";
import { PlaylistApiResponse } from "@/schemas/playlist.schema";
import { ApiResponse } from "@/types/api.types";
import { getOrderedPlaylist } from "@/utils/playlist.util";
import { PLAYLIST_QUERY_KEY } from "../query/usePlaylist";
import { axiosClient } from "@/client/axios.client";

export const ORDER_PLAYLIST_MUTATION_KEY = "orderPlaylist";

const orderPlaylist = () => {
  return async (data: OrderPlaylistFormValues) => {
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

export const useOrderPlaylist = (uuid?: string) => {
  return useMutation<
    ApiResponse<unknown>,
    Error,
    OrderPlaylistFormValues,
    PlaylistApiResponse
  >(orderPlaylist(), {
    mutationKey: [ORDER_PLAYLIST_MUTATION_KEY],
    onMutate: async (variables) => {
      // Snapshot that represents the server state before any optimistic updates
      const snapshotPlaylist = queryClient.getQueryData<PlaylistApiResponse>([
        PLAYLIST_QUERY_KEY,
        uuid,
      ]);

      // Optimistically update to the new value
      await queryClient.setQueryData(
        [PLAYLIST_QUERY_KEY, uuid],

        // 'oldPlaylist' here is the current state of playlist
        (oldPlaylist: PlaylistApiResponse) => {
          const orderedItems = variables.values.order;

          const orderedPlaylist = getOrderedPlaylist({
            previousPlaylist: oldPlaylist,
            orderedItems: orderedItems,
          });

          return orderedPlaylist;
        },
      );

      // Return a context with the old value
      return snapshotPlaylist;
    },
    onError: (_, __, context) => {
      queryClient.setQueryData([PLAYLIST_QUERY_KEY, uuid], context);
    },
  });
};
