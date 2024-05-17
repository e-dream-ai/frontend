import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

type MutateFunctionParams = {
  uuid?: string;
};

export const UNVOTE_DREAM_MUTATION_KEY = "unvoteDream";

const unvoteDream = ({ uuid }: MutateFunctionParams) => {
  return async () => {
    return axiosClient
      .put(
        `/dream/${uuid ?? ""}/unvote`,
        {},
        {
          headers: getRequestHeaders({
            contentType: ContentType.json,
          }),
        },
      )
      .then((res) => {
        return res.data;
      });
  };
};

export const useUnvoteDream = (uuid?: string) => {
  return useMutation<ApiResponse<{ dream: Dream }>, Error>(
    unvoteDream({ uuid }),
    {
      mutationKey: [UNVOTE_DREAM_MUTATION_KEY],
    },
  );
};
