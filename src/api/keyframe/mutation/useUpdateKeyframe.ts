import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { UpdateKeyframeRequestValues } from "@/schemas/update-keyframe.schema";
import { ApiResponse } from "@/types/api.types";
import { Keyframe } from "@/types/keyframe.types";
import { axiosClient } from "@/client/axios.client";

export const UPDATE_KEYFRAME_MUTATION_KEY = "updateKeyframe";

const updateKeyframe = () => {
  return async (data: UpdateKeyframeRequestValues) => {
    const { uuid, values } = data;
    return axiosClient
      .put(`/v1/keyframe/${uuid}`, values, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useUpdateKeyframe = () => {
  return useMutation<
    ApiResponse<{ keyframe: Keyframe }>,
    Error,
    UpdateKeyframeRequestValues
  >(updateKeyframe(), {
    mutationKey: [UPDATE_KEYFRAME_MUTATION_KEY],
  });
};
