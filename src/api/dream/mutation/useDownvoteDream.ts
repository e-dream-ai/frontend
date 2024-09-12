import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

type MutateFunctionParams = {
  uuid?: string;
};

export const DOWNVOTE_DREAM_MUTATION_KEY = "downvoteDream";

const downvoteDream = ({ uuid }: MutateFunctionParams) => {
  return async () => {
    return axiosClient
      .put(
        `/v1/dream/${uuid ?? ""}/downvote`,
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

export const useDownvoteDream = (uuid?: string) => {
  return useMutation<ApiResponse<{ dream: Dream }>, Error>(
    downvoteDream({ uuid }),
    {
      mutationKey: [DOWNVOTE_DREAM_MUTATION_KEY],
    },
  );
};
