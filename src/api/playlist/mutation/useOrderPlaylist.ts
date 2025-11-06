import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { OrderPlaylistFormValues } from "@/schemas/order-playlist.schema";
import { ApiResponse } from "@/types/api.types";
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

export const useOrderPlaylist = () => {
  return useMutation<
    ApiResponse<unknown>,
    Error,
    OrderPlaylistFormValues,
    void
  >(orderPlaylist(), {
    mutationKey: [ORDER_PLAYLIST_MUTATION_KEY],
  });
};
