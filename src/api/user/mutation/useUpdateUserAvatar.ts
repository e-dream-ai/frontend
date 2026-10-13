import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { FileFormValues } from "@/schemas/file.schema";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";
import { createImageFormData } from "@/utils/image-encode/image-encode";

type MutateFunctionParams = {
  uuid?: string;
};

export const UPDATE_USER_AVATAR_MUTATION_KEY = "updateUserAvatar";

const updateUserAvatar = ({ uuid }: MutateFunctionParams) => {
  return async (params: FileFormValues) => {
    const formData = await createImageFormData(params?.file, "avatar");

    return axiosClient
      .put(`/v1/user/${uuid}/avatar`, formData, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

export const useUpdateUserAvatar = ({ uuid }: { uuid?: string }) => {
  return useMutation<ApiResponse<{ user: User }>, Error, FileFormValues>(
    updateUserAvatar({ uuid }),
    {
      mutationKey: [UPDATE_USER_AVATAR_MUTATION_KEY],
    },
  );
};
