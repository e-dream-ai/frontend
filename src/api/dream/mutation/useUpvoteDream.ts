import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

type MutateFunctionParams = {
  uuid?: string;
};

export const UPVOTE_DREAM_MUTATION_KEY = "upvoteDream";

const upvoteDream = ({ uuid }: MutateFunctionParams) => {
  return async () => {
    return axiosClient
      .put(
        `/dream/${uuid ?? ""}/upvote`,
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

export const useUpvoteDream = (uuid?: string) => {
  return useMutation<ApiResponse<{ dream: Dream }>, Error>(
    upvoteDream({ uuid }),
    {
      mutationKey: [UPVOTE_DREAM_MUTATION_KEY],
    },
  );
};
