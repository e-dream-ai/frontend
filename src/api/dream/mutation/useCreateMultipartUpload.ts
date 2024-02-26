import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { MultipartUpload } from "@/types/dream.types";
import { CancelTokenSource } from "axios";
import { CreateMultipartUploadFormValues } from "@/schemas/multipart-upload";

export const CREATE_MULTIPART_UPLOAD_MUTATION_KEY = "createMultipartUpload";

type CreateMultipartUploadProps = {
  cancelTokenSource?: CancelTokenSource;
};

const createMultipartUpload = ({
  cancelTokenSource,
}: CreateMultipartUploadProps) => {
  return async (params: CreateMultipartUploadFormValues) => {
    return axiosClient
      .post(`/dream/create-multipart-upload`, params, {
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
 * Creates multipart upload
 * @returns UseMutationResult
 */
export const useCreateMultipartUpload = ({
  cancelTokenSource,
}: {
  cancelTokenSource?: CancelTokenSource;
}) => {
  return useMutation<
    ApiResponse<MultipartUpload>,
    Error,
    CreateMultipartUploadFormValues
  >(createMultipartUpload({ cancelTokenSource }), {
    mutationKey: [CREATE_MULTIPART_UPLOAD_MUTATION_KEY],
  });
};
