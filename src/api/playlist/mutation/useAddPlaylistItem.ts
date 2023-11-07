import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { AddPlaylistItemFormValues } from "schemas/add-playlist-item.schema";
import { ApiResponse } from "types/api.types";
import { Playlist } from "types/playlist.types";

type MutateFunctionParams = {
  id?: number;
};

export const ADD_PLAYLIST_ITEM_MUTATION_KEY = "addPlaylistItem";

const addPlaylistItem = ({ id }: MutateFunctionParams) => {
  return async (values: AddPlaylistItemFormValues) => {
    return axios
      .put(`${URL}/playlist/${id ?? "0"}/add-item`, values, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useAddPlaylistItem = (id?: number) => {
  return useMutation<
    ApiResponse<{ playlist: Playlist }>,
    Error,
    AddPlaylistItemFormValues
  >(addPlaylistItem({ id }), {
    mutationKey: [ADD_PLAYLIST_ITEM_MUTATION_KEY],
  });
};
