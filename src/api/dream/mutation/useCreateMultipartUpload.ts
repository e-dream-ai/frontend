import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { MultipartUpload } from "@/types/dream.types";
import { axiosClient } from "@/client/axios.client";
import { CreateMultipartUploadFormValues } from "@/schemas/multipart-upload";

export const CREATE_MULTIPART_UPLOAD_MUTATION_KEY = "createMultipartUpload";

const createMultipartUpload = () => {
  return async (params: CreateMultipartUploadFormValues) => {
    return axiosClient
      .post(`/dream/create-multipart-upload`, params, {
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
 * Creates multipart upload
 * @returns UseMutationResult
 */
export const useCreateMultipartUpload = () => {
  return useMutation<
    ApiResponse<MultipartUpload>,
    Error,
    CreateMultipartUploadFormValues
  >(createMultipartUpload(), {
    mutationKey: [CREATE_MULTIPART_UPLOAD_MUTATION_KEY],
  });
};
