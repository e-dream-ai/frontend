import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { PresignedPost } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";

export const CREATE_PRESIGNED_POST_MUTATION_KEY = "createPresignedPost";

const createPresignedPost = () => {
  return async () => {
    return axiosClient
      .post(
        `/dream/create-presigned-post`,
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

export const useCreatePresignedPost = () => {
  return useMutation<ApiResponse<PresignedPost>, Error, unknown>(
    createPresignedPost(),
    {
      mutationKey: [CREATE_PRESIGNED_POST_MUTATION_KEY],
    },
  );
};
