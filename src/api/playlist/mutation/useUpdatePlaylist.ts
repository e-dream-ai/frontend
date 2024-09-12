import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { UpdatePlaylistRequestValues } from "@/schemas/update-playlist.schema";
import { ApiResponse } from "@/types/api.types";
import { Playlist } from "@/types/playlist.types";
import { axiosClient } from "@/client/axios.client";

export const UPDATE_PLAYLIST_MUTATION_KEY = "updatePlaylist";

const updatePlaylist = () => {
  return async (data: UpdatePlaylistRequestValues) => {
    const { uuid, values } = data;
    return axiosClient
      .put(`/v1/playlist/${uuid}`, values, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useUpdatePlaylist = () => {
  return useMutation<
    ApiResponse<{ playlist: Playlist }>,
    Error,
    UpdatePlaylistRequestValues
  >(updatePlaylist(), {
    mutationKey: [UPDATE_PLAYLIST_MUTATION_KEY],
  });
};
