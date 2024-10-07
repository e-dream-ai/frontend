import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { FILE_FORM } from "@/constants/file.constants";
import { FileFormValues } from "@/schemas/file.schema";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

type MutateFunctionParams = {
  uuid?: string;
};

export const UPDATE_USER_AVATAR_MUTATION_KEY = "updateUserAvatar";

const updateUserAvatar = ({ uuid }: MutateFunctionParams) => {
  return async (params: FileFormValues) => {
    const formData = new FormData();

    formData.append(FILE_FORM.FILE, params?.file ?? "");

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
