import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";
import { CancelTokenSource } from "axios";
import {
  InitKeyframeImageMultipartUploadFormValues,
  InitKeyframeImageMultipartUploadResponse,
} from "@/schemas/update-keyframe.schema";

export const INIT_KEYFRAME_IMAGE_MULTIPART_UPLOAD_MUTATION_KEY =
  "initKeyframeImageMultipartUpload";

type CreateMultipartUploadProps = {
  cancelTokenSource?: CancelTokenSource;
};

const initKeyframeImageMultipartUpload = ({
  cancelTokenSource,
}: CreateMultipartUploadProps) => {
  return async (data: InitKeyframeImageMultipartUploadFormValues) => {
    const { uuid, values } = data;
    return axiosClient
      .post(`/v1/keyframe/${uuid}/image/init`, values, {
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
export const useInitKeyframeImageMultipartUpload = ({
  cancelTokenSource,
}: {
  cancelTokenSource?: CancelTokenSource;
}) => {
  return useMutation<
    ApiResponse<InitKeyframeImageMultipartUploadResponse>,
    Error,
    InitKeyframeImageMultipartUploadFormValues
  >(initKeyframeImageMultipartUpload({ cancelTokenSource }), {
    mutationKey: [INIT_KEYFRAME_IMAGE_MULTIPART_UPLOAD_MUTATION_KEY],
  });
};
