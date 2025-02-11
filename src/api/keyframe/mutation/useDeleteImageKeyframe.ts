import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";

export const DELETE_IMAGE_KEYFRAME_MUTATION_KEY = "deleteImageKeyframe";

const deleteImageKeyframe = () => {
  return async (uuid: string) => {
    return axiosClient
      .delete(`/v1/keyframe/${uuid}/image`, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useDeleteImageKeyframe = () => {
  return useMutation<ApiResponse<unknown>, Error, string>(
    deleteImageKeyframe(),
    {
      mutationKey: [DELETE_IMAGE_KEYFRAME_MUTATION_KEY],
    },
  );
};
