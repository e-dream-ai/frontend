import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Playlist } from "@/types/playlist.types";
import { axiosClient } from "@/client/axios.client";

export const DELETE_PLAYLIST_MUTATION_KEY = "deletePlaylist";

const deletePlaylist = () => {
  return async (uuid: string) => {
    return axiosClient
      .delete(`/v1/playlist/${uuid}`, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useDeletePlaylist = () => {
  return useMutation<ApiResponse<{ playlist: Playlist }>, Error, string>(
    deletePlaylist(),
    {
      mutationKey: [DELETE_PLAYLIST_MUTATION_KEY],
    },
  );
};
