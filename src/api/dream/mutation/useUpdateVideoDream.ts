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

export const UPDATE_VIDEO_DREAM_MUTATION_KEY = "updateVideoDream";

const updateVideoDream = ({ uuid }: MutateFunctionParams) => {
  return async (params: FileDreamFormValues) => {
    const formData = new FormData();

    formData.append(FILE_DREAM_FORM.FILE, params?.file ?? "");

    return axios
      .put(`${URL}/dream/${uuid}/video`, formData, {
        method: "put",
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useUpdateVideoDream = (uuid?: string) => {
  return useMutation<ApiResponse<{ dream: Dream }>, Error, FileDreamFormValues>(
    updateVideoDream({ uuid }),
    {
      mutationKey: [UPDATE_VIDEO_DREAM_MUTATION_KEY],
    },
  );
};
