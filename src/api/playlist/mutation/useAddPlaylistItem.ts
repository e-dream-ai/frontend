import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { AddPlaylistItemFormValues } from "@/schemas/add-playlist-item.schema";
import { ApiResponse } from "@/types/api.types";
import { Playlist } from "@/types/playlist.types";
import { axiosClient } from "@/client/axios.client";

export const ADD_PLAYLIST_ITEM_MUTATION_KEY = "addPlaylistItem";

const addPlaylistItem = () => {
  return async (values: AddPlaylistItemFormValues) => {
    const { playlistId, ...requestValues } = values;
    return axiosClient
      .put(`/playlist/${playlistId}/add-item`, requestValues, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useAddPlaylistItem = () => {
  return useMutation<
    ApiResponse<{ playlist: Playlist }>,
    Error,
    AddPlaylistItemFormValues
  >(addPlaylistItem(), {
    mutationKey: [ADD_PLAYLIST_ITEM_MUTATION_KEY],
  });
};
