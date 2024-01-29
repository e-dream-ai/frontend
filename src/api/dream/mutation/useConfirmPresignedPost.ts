import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

export const CONFIRM_PRESIGNED_POST_MUTATION_KEY = "confirmPresignedPost";

const confirmPresignedPost = () => {
  return async (uuid?: string) => {
    return axiosClient
      .post(
        `/dream/${uuid}/confirm-presigned-post`,
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

export const useConfirmPresignedPost = () => {
  return useMutation<ApiResponse<{ dream: Dream }>, Error, string | undefined>(
    confirmPresignedPost(),
    {
      mutationKey: [CONFIRM_PRESIGNED_POST_MUTATION_KEY],
    },
  );
};
