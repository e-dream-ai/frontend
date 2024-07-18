import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { DeletePlaylistItemFormValues } from "@/schemas/delete-playlist-item.schema";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";

export const DELETE_PLAYLIST_ITEM_MUTATION_KEY = "deletePlaylistItem";

const deletePlaylistItem = () => {
  return async (values: DeletePlaylistItemFormValues) => {
    const { playlistId, itemId } = values;
    return axiosClient
      .delete(`/playlist/${playlistId}/remove-item/${itemId}`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useDeletePlaylistItem = () => {
  return useMutation<ApiResponse<unknown>, Error, DeletePlaylistItemFormValues>(
    deletePlaylistItem(),
    {
      mutationKey: [DELETE_PLAYLIST_ITEM_MUTATION_KEY],
    },
  );
};
