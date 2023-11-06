import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { FILE_FORM } from "constants/file.constants";
import { FileFormValues } from "schemas/file.schema";
import { ApiResponse } from "types/api.types";
import { Dream } from "types/dream.types";

export const CREATE_DREAM_MUTATION_KEY = "createDream";

const createDream = () => {
  return async (params: FileFormValues) => {
    const formData = new FormData();

    formData.append(FILE_FORM.FILE, params?.file ?? "");

    return axios
      .post(`${URL}/dream`, formData, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useCreateDream = () => {
  return useMutation<ApiResponse<{ dream: Dream }>, Error, FileFormValues>(
    createDream(),
    {
      mutationKey: [CREATE_DREAM_MUTATION_KEY],
    },
  );
};
