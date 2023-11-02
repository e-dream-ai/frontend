import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { CreatePlaylistFormValues } from "schemas/create-playlist.schema";
import { ApiResponse } from "types/api.types";
import { Playlist } from "types/playlist.types";

export const CREATE_PLAYLIST_MUTATION_KEY = "createPlaylist";

const createPlaylist = () => {
  return async (params: CreatePlaylistFormValues) => {
    return axios
      .post(`${URL}/playlist`, params, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useCreatePlaylist = () => {
  return useMutation<
    ApiResponse<{ playlist: Playlist }>,
    Error,
    CreatePlaylistFormValues
  >(createPlaylist(), {
    mutationKey: [CREATE_PLAYLIST_MUTATION_KEY],
  });
};
