import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { OrderPlaylistFormValues } from "schemas/order-playlist.schema";
import { ApiResponse } from "types/api.types";

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
  return useMutation<ApiResponse<unknown>, Error, OrderPlaylistFormValues>(
    orderPlaylist({ id }),
    {
      mutationKey: [ORDER_PLAYLIST_MUTATION_KEY],
    },
  );
};
