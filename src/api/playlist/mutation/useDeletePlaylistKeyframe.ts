import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { DeletePlaylistKeyframeFormValues } from "@/schemas/delete-playlist-keyframe.schema";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";

export const DELETE_PLAYLIST_KEYFRAME_MUTATION_KEY = "deletePlaylistKeyframe";

const deletePlaylistKeyframe = () => {
  return async (values: DeletePlaylistKeyframeFormValues) => {
    const { playlistUUID, playlistKeyframeId } = values;
    return axiosClient
      .delete(`/v1/playlist/${playlistUUID}/keyframe/${playlistKeyframeId}`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useDeletePlaylistKeyframe = () => {
  return useMutation<
    ApiResponse<unknown>,
    Error,
    DeletePlaylistKeyframeFormValues
  >(deletePlaylistKeyframe(), {
    mutationKey: [DELETE_PLAYLIST_KEYFRAME_MUTATION_KEY],
  });
};
