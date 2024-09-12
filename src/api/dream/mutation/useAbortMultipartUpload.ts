import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { AbortMultipartUploadFormValues } from "@/schemas/multipart-upload";

export const ABORT_MULTIPART_UPLOAD_MUTATION_KEY = "abortMultipartUpload";

const abortMultipartUpload = () => {
  return async ({ uuid, ...params }: AbortMultipartUploadFormValues) => {
    return axiosClient
      .post(`/v1/dream/${uuid}/abort-multipart-upload`, params, {
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
 * Aborts multipart upload
 * @returns UseMutationResult
 */
export const useAbortMultipartUpload = () => {
  return useMutation<
    ApiResponse<{ dream: Dream }>,
    Error,
    AbortMultipartUploadFormValues
  >(abortMultipartUpload(), {
    mutationKey: [ABORT_MULTIPART_UPLOAD_MUTATION_KEY],
  });
};
