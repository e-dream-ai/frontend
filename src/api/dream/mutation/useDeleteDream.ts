import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "@/constants/api.constants";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";

export const DELETE_DREAM_MUTATION_KEY = "deleteDream";

type MutateFunctionParams = {
  uuid?: string;
};

const deleteDream = ({ uuid }: MutateFunctionParams) => {
  return async () => {
    return axios
      .delete(`${URL}/dream/${uuid}`, {
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
