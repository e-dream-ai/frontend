import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { Keyframe } from "@/types/keyframe.types";
import { axiosClient } from "@/client/axios.client";

export const DELETE_KEYFRAME_MUTATION_KEY = "deleteKeyframe";

const deleteKeyframe = () => {
  return async (uuid: string) => {
    return axiosClient
      .delete(`/v1/keyframe/${uuid}`, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useDeleteKeyframe = () => {
  return useMutation<ApiResponse<{ keyframe: Keyframe }>, Error, string>(
    deleteKeyframe(),
    {
      mutationKey: [DELETE_KEYFRAME_MUTATION_KEY],
    },
  );
};
