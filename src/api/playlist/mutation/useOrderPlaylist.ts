import { useMutation } from "@tanstack/react-query";
import queryClient from "@/api/query-client";
import axios from "axios";
import { URL } from "@/constants/api.constants";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { OrderPlaylistFormValues } from "@/schemas/order-playlist.schema";
import { PlaylistApiResponse } from "@/schemas/playlist.schema";
import { ApiResponse } from "@/types/api.types";
import { getOrderedPlaylist } from "@/utils/playlist.util";
import { PLAYLIST_QUERY_KEY } from "../query/usePlaylist";

type MutateFunctionParams = {
  id?: number;
};

export const ORDER_PLAYLIST_MUTATION_KEY = "orderPlaylist";

const orderPlaylist = ({ id }: MutateFunctionParams) => {
  return async (values: OrderPlaylistFormValues) => {
    return axios
      .put(`${URL}/playlist/${id ?? ""}/order`, values, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useOrderPlaylist = (id?: number) => {
  return useMutation<
    ApiResponse<unknown>,
    Error,
    OrderPlaylistFormValues,
    PlaylistApiResponse
  >(orderPlaylist({ id }), {
    mutationKey: [ORDER_PLAYLIST_MUTATION_KEY],
    onMutate: async (orderedItems) => {
      // invalidateQueries
      await queryClient.invalidateQueries([PLAYLIST_QUERY_KEY, id]);

      // Snapshot the previous playlist value
      const previousPlaylist = queryClient.getQueryData<PlaylistApiResponse>([
        PLAYLIST_QUERY_KEY,
        id,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        [PLAYLIST_QUERY_KEY, id],
        getOrderedPlaylist({
          previousPlaylist,
          orderedItems: orderedItems.order,
        }),
      );

      // Return a context with the old value
      return previousPlaylist;
    },
    onError: (_, __, context) => {
      queryClient.setQueryData([PLAYLIST_QUERY_KEY, id], context);
    },
  });
};
