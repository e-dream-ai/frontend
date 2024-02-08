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
        `/dream/${uuid}/confirm-presigned-post`,
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

export const useConfirmPresignedPost = () => {
  return useMutation<
    ApiResponse<{ dream: Dream }>,
    Error,
    ConfirmDreamFormValues
  >(confirmPresignedPost(), {
    mutationKey: [CONFIRM_PRESIGNED_POST_MUTATION_KEY],
  });
};
