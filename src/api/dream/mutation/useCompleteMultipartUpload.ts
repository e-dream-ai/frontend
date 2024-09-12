import { useMutation } from "@tanstack/react-query";
import { CancelTokenSource } from "axios";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Dream } from "@/types/dream.types";
import { CompleteMultipartUploadFormValues } from "@/schemas/multipart-upload";

export const COMPLETE_MULTIPART_UPLOAD_MUTATION_KEY = "completeMultipartUpload";

type CompleteMultipartUploadProps = {
  cancelTokenSource?: CancelTokenSource;
};

const completeMultipartUpload = ({
  cancelTokenSource,
}: CompleteMultipartUploadProps) => {
  return async ({ uuid, ...params }: CompleteMultipartUploadFormValues) => {
    return axiosClient
      .post(`/v1/dream/${uuid}/complete-multipart-upload`, params, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
        cancelToken: cancelTokenSource?.token,
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
export const useCompleteMultipartUpload = ({
  cancelTokenSource,
}: {
  cancelTokenSource?: CancelTokenSource;
}) => {
  return useMutation<
    ApiResponse<{ dream: Dream }>,
    Error,
    CompleteMultipartUploadFormValues
  >(completeMultipartUpload({ cancelTokenSource }), {
    mutationKey: [COMPLETE_MULTIPART_UPLOAD_MUTATION_KEY],
  });
};
