import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { FileFormValues } from "@/schemas/file.schema";
import { ApiResponse } from "@/types/api.types";
import { Playlist } from "@/types/playlist.types";
import { axiosClient } from "@/client/axios.client";
import { createImageFormData } from "@/utils/image-encode/image-encode";

type MutateFunctionParams = {
  uuid?: string;
};

export const UPDATE_THUMBNAIL_PLAYLIST_MUTATION_KEY = "updateThumbnailPlaylist";

const updateThumbnailPlaylist = ({ uuid }: MutateFunctionParams) => {
  return async (params: FileFormValues) => {
    const formData = await createImageFormData(params?.file, "thumbnail");

    return axiosClient
      .put(`/v1/playlist/${uuid}/thumbnail`, formData, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useUpdateThumbnailPlaylist = (uuid?: string) => {
  return useMutation<
    ApiResponse<{ playlist: Playlist }>,
    Error,
    FileFormValues
  >(updateThumbnailPlaylist({ uuid }), {
    mutationKey: [UPDATE_THUMBNAIL_PLAYLIST_MUTATION_KEY],
  });
};
