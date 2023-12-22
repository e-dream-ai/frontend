import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "@/constants/api.constants";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { UpdatePlaylistFormValues } from "@/schemas/update-playlist.schema";
import { ApiResponse } from "@/types/api.types";
import { Playlist } from "@/types/playlist.types";

type MutateFunctionParams = {
  id?: number;
};

export const UPDATE_PLAYLIST_MUTATION_KEY = "updatePlaylist";

const updatePlaylist = ({ id }: MutateFunctionParams) => {
  return async (values: UpdatePlaylistFormValues) => {
    return axios
      .put(`${URL}/playlist/${id ?? ""}`, values, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useUpdatePlaylist = (id?: number) => {
  return useMutation<
    ApiResponse<{ playlist: Playlist }>,
    Error,
    UpdatePlaylistFormValues
  >(updatePlaylist({ id }), {
    mutationKey: [UPDATE_PLAYLIST_MUTATION_KEY],
  });
};
