import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { RefreshMultipartUpload } from "@/types/dream.types";
import { CancelTokenSource } from "axios";
import { RefreshMultipartUploadUrlFormValues } from "@/schemas/multipart-upload";

export const REFRESH_MULTIPART_UPLOAD_URL_MUTATION_KEY =
  "refreshMultipartUploadUrl";

type RefreshMultipartUploadUrlProps = {
  cancelTokenSource?: CancelTokenSource;
};

const refreshMultipartUploadUrl = ({
  cancelTokenSource,
}: RefreshMultipartUploadUrlProps) => {
  return async ({ uuid, ...params }: RefreshMultipartUploadUrlFormValues) => {
    return axiosClient
      .post(`/dream/${uuid}/refresh-multipart-upload-url`, params, {
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
 * Refresh multipart upload
 * @returns UseMutationResult
 */
export const useRefreshMultipartUploadUrl = ({
  cancelTokenSource,
}: {
  cancelTokenSource?: CancelTokenSource;
}) => {
  return useMutation<
    ApiResponse<RefreshMultipartUpload>,
    Error,
    RefreshMultipartUploadUrlFormValues
  >(refreshMultipartUploadUrl({ cancelTokenSource }), {
    mutationKey: [REFRESH_MULTIPART_UPLOAD_URL_MUTATION_KEY],
  });
};
