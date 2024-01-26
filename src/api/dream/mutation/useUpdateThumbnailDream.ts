import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { FILE_FORM } from "@/constants/file.constants";
import { FileFormValues } from "@/schemas/file.schema";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

type MutateFunctionParams = {
  uuid?: string;
};

export const UPDATE_THUMBNAIL_DREAM_MUTATION_KEY = "updateThumbnailDream";

const updateThumbnailDream = ({ uuid }: MutateFunctionParams) => {
  return async (params: FileFormValues) => {
    const formData = new FormData();

    formData.append(FILE_FORM.FILE, params?.file ?? "");

    return axiosClient
      .put(`/dream/${uuid}/thumbnail`, formData, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useUpdateThumbnailDream = (uuid?: string) => {
  return useMutation<ApiResponse<{ dream: Dream }>, Error, FileFormValues>(
    updateThumbnailDream({ uuid }),
    {
      mutationKey: [UPDATE_THUMBNAIL_DREAM_MUTATION_KEY],
    },
  );
};
