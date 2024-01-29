import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

export const DELETE_DREAM_MUTATION_KEY = "deleteDream";

type MutateFunctionParams = {
  uuid?: string;
};

const deleteDream = ({ uuid }: MutateFunctionParams) => {
  return async () => {
    return axiosClient
      .delete(`/dream/${uuid}`, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useDeleteDream = (uuid?: string) => {
  return useMutation<ApiResponse<{ dream: Dream }>, Error, unknown>(
    deleteDream({ uuid }),
    {
      mutationKey: [DELETE_DREAM_MUTATION_KEY],
    },
  );
};
