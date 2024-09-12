import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";
import { ConfirmDreamFormValues } from "@/schemas/confirm-dream.schema";

export const CONFIRM_PRESIGNED_POST_MUTATION_KEY = "confirmPresignedPost";

const confirmPresignedPost = () => {
  return async ({ uuid, name, extension }: ConfirmDreamFormValues) => {
    return axiosClient
      .post(
        `/v1/dream/${uuid}/confirm-presigned-post`,
        { name, extension },
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

/**
 * Confirms presigned post, use useCreatePresignedPost to create presigned post and useUploadFilePresignedPost to upload file before use this hook
 * @returns UseMutationResult
 */
export const useConfirmPresignedPost = () => {
  return useMutation<
    ApiResponse<{ dream: Dream }>,
    Error,
    ConfirmDreamFormValues
  >(confirmPresignedPost(), {
    mutationKey: [CONFIRM_PRESIGNED_POST_MUTATION_KEY],
  });
};
