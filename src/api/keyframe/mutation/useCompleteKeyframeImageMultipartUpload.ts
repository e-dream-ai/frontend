import { useMutation } from "@tanstack/react-query";
import { CancelTokenSource } from "axios";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { CompleteKeyframeImageMultipartUploadFormValues } from "@/schemas/update-keyframe.schema";

export const COMPLETE_KEYFRAME_IMAGE_MULTIPART_UPLOAD_MUTATION_KEY =
  "completeKeyframeImageMultipartUpload";

type CompleteMultipartUploadProps = {
  cancelTokenSource?: CancelTokenSource;
};

const completeKeyframeImageMultipartUpload = ({
  cancelTokenSource,
}: CompleteMultipartUploadProps) => {
  return async ({
    uuid,
    values,
  }: CompleteKeyframeImageMultipartUploadFormValues) => {
    return axiosClient
      .post(`/v1/keyframe/${uuid}/image/complete`, values, {
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
export const useCompleteKeyframeImageMultipartUpload = ({
  cancelTokenSource,
}: {
  cancelTokenSource?: CancelTokenSource;
}) => {
  return useMutation<
    ApiResponse<unknown>,
    Error,
    CompleteKeyframeImageMultipartUploadFormValues
  >(completeKeyframeImageMultipartUpload({ cancelTokenSource }), {
    mutationKey: [COMPLETE_KEYFRAME_IMAGE_MULTIPART_UPLOAD_MUTATION_KEY],
  });
};
