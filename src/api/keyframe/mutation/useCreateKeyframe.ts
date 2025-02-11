import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { CreateKeyframeFormRequest } from "@/schemas/create-keyframe.schema";
import { ApiResponse } from "@/types/api.types";
import { Keyframe } from "@/types/keyframe.types";
import { axiosClient } from "@/client/axios.client";

export const CREATE_KEYFRAME_MUTATION_KEY = "createKeyframe";

const createKeyframe = () => {
  return async (params: CreateKeyframeFormRequest) => {
    return axiosClient
      .post(`/v1/keyframe`, params, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useCreateKeyframe = () => {
  return useMutation<
    ApiResponse<{ keyframe: Keyframe }>,
    Error,
    CreateKeyframeFormRequest
  >(createKeyframe(), {
    mutationKey: [CREATE_KEYFRAME_MUTATION_KEY],
  });
};
