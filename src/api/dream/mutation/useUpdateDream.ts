import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { UpdateDreamRequestValues } from "@/schemas/update-dream.schema";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

type MutateFunctionParams = {
  uuid?: string;
};

export const UPDATE_DREAM_MUTATION_KEY = "updateDream";

const updateDream = ({ uuid }: MutateFunctionParams) => {
  return async (values: UpdateDreamRequestValues) => {
    return axiosClient
      .put(`/v1/dream/${uuid ?? ""}`, values, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useUpdateDream = (uuid?: string) => {
  return useMutation<
    ApiResponse<{ dream: Dream }>,
    Error,
    UpdateDreamRequestValues
  >(updateDream({ uuid }), {
    mutationKey: [UPDATE_DREAM_MUTATION_KEY],
  });
};
