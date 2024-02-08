import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { PresignedPost } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";
import { CreatePresignedDreamFormValues } from "@/schemas/create-presigned-dream.schema";

export const CREATE_PRESIGNED_POST_MUTATION_KEY = "createPresignedPost";

const createPresignedPost = () => {
  return async (params: CreatePresignedDreamFormValues) => {
    return axiosClient
      .post(`/dream/create-presigned-post`, params, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useCreatePresignedPost = () => {
  return useMutation<
    ApiResponse<PresignedPost>,
    Error,
    CreatePresignedDreamFormValues
  >(createPresignedPost(), {
    mutationKey: [CREATE_PRESIGNED_POST_MUTATION_KEY],
  });
};
