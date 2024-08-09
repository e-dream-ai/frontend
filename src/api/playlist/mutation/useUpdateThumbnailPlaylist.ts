import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { FILE_FORM } from "@/constants/file.constants";
import { FileFormValues } from "@/schemas/file.schema";
import { ApiResponse } from "@/types/api.types";
import { Playlist } from "@/types/playlist.types";
import { axiosClient } from "@/client/axios.client";

type MutateFunctionParams = {
  uuid?: string;
};

export const UPDATE_THUMBNAIL_PLAYLIST_MUTATION_KEY = "updateThumbnailPlaylist";

const updateThumbnailPlaylist = ({ uuid }: MutateFunctionParams) => {
  return async (params: FileFormValues) => {
    const formData = new FormData();

    formData.append(FILE_FORM.FILE, params?.file ?? "");

    return axiosClient
      .put(`/playlist/${uuid}/thumbnail`, formData, {
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
