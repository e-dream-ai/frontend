import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { PresignedPost } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

export const CONFIRM_PRESIGNED_POST_MUTATION_KEY = "confirmPresignedPost";

const confirmPresignedPost = () => {
  return async () => {
    return axiosClient
      .post(
        `/dream/confirm-presigned-post`,
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
  return useMutation<ApiResponse<PresignedPost>, Error, unknown>(
    confirmPresignedPost(),
    {
      mutationKey: [CONFIRM_PRESIGNED_POST_MUTATION_KEY],
    },
  );
};
