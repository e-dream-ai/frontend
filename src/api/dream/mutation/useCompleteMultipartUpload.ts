import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";
import { CompleteMultipartUploadFormValues } from "@/schemas/multipart-upload";

export const COMPLETE_MULTIPART_UPLOAD_MUTATION_KEY = "completeMultipartUpload";

const completeMultipartUpload = () => {
  return async ({ uuid, ...params }: CompleteMultipartUploadFormValues) => {
    return axiosClient
      .post(`/dream/${uuid}/complete-multipart-upload`, params, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

/**
 * Completes multipart upload
 * @returns UseMutationResult
 */
export const useCompleteMultipartUpload = () => {
  return useMutation<
    ApiResponse<{ dream: Dream }>,
    Error,
    CompleteMultipartUploadFormValues
  >(completeMultipartUpload(), {
    mutationKey: [COMPLETE_MULTIPART_UPLOAD_MUTATION_KEY],
  });
};
