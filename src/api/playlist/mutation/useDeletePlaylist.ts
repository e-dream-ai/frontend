import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { ApiResponse } from "types/api.types";
import { Playlist } from "types/playlist.types";

export const DELETE_PLAYLIST_MUTATION_KEY = "deletePlaylist";

type MutateFunctionParams = {
  id?: number;
};

const deletePlaylist = ({ id }: MutateFunctionParams) => {
  return async () => {
    return axios
      .delete(`${URL}/playlist/${id}`, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useDeletePlaylist = (id?: number) => {
  return useMutation<ApiResponse<{ playlist: Playlist }>, Error, unknown>(
    deletePlaylist({ id }),
    {
      mutationKey: [DELETE_PLAYLIST_MUTATION_KEY],
    },
  );
};
