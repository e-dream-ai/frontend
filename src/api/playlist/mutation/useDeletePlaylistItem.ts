import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "@/constants/api.constants";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { DeletePlaylistItemFormValues } from "@/schemas/delete-playlist-item.schema";
import { ApiResponse } from "@/types/api.types";

type MutateFunctionParams = {
  id?: number;
};

export const DELETE_PLAYLIST_ITEM_MUTATION_KEY = "deletePlaylistItem";

const deletePlaylistItem = ({ id }: MutateFunctionParams) => {
  return async (values: DeletePlaylistItemFormValues) => {
    return axios
      .delete(
        `${URL}/playlist/${id ?? "0"}/remove-item/${values?.itemId ?? "0"}`,
        {
          headers: getRequestHeaders({
            contentType: ContentType.json,
          }),
        },
      )
      .then((res) => {
        return res.data;
      });
  };
};

export const useDeletePlaylistItem = (id?: number) => {
  return useMutation<ApiResponse<unknown>, Error, DeletePlaylistItemFormValues>(
    deletePlaylistItem({ id }),
    {
      mutationKey: [DELETE_PLAYLIST_ITEM_MUTATION_KEY],
    },
  );
};
