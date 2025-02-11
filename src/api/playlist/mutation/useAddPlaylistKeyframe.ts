import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { AddPlaylistKeyframeFormValues } from "@/schemas/add-playlist-keyframe.schema";
import { ApiResponse } from "@/types/api.types";
import { Playlist } from "@/types/playlist.types";
import { axiosClient } from "@/client/axios.client";

export const ADD_PLAYLIST_KEYFRAME_MUTATION_KEY = "addPlaylistKeyframe";

const addPlaylistKeyframe = () => {
  return async (data: AddPlaylistKeyframeFormValues) => {
    const { uuid, values } = data;
    return axiosClient
      .post(`/v1/playlist/${uuid}/keyframe`, values, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useAddPlaylistKeyframe = () => {
  return useMutation<
    ApiResponse<{ playlist: Playlist }>,
    Error,
    AddPlaylistKeyframeFormValues
  >(addPlaylistKeyframe(), {
    mutationKey: [ADD_PLAYLIST_KEYFRAME_MUTATION_KEY],
  });
};
