import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { FILE_DREAM_FORM } from "constants/dreams.constants";
import { FileDreamFormValues } from "schemas/file-dream.schema";
import { ApiResponse } from "types/api.types";
import { Dream } from "types/dream.types";

type MutateFunctionParams = {
  uuid?: string;
};

export const UPDATE_THUMBNAIL_DREAM_MUTATION_KEY = "updateThumbnailDream";

const updateThumbnailDream = ({ uuid }: MutateFunctionParams) => {
  return async (params: FileDreamFormValues) => {
    const formData = new FormData();

    formData.append(FILE_DREAM_FORM.FILE, params?.file ?? "");

    return axios
      .put(`${URL}/dream/${uuid}/thumbnail`, formData, {
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
  return useMutation<ApiResponse<{ dream: Dream }>, Error, FileDreamFormValues>(
    updateThumbnailDream({ uuid }),
    {
      mutationKey: [UPDATE_THUMBNAIL_DREAM_MUTATION_KEY],
    },
  );
};
