import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ProfileFormRequest } from "@/schemas/profile.schema";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const UPDATE_USER_MUTATION_KEY = "updateUser";

const updateUser = ({ uuid }: { uuid?: string }) => {
  return async (params: ProfileFormRequest) => {
    return axiosClient
      .put(`/v1/user/${uuid}`, params, {
        headers: getRequestHeaders({
          contentType: ContentType.none,
        }),
      })
      .then((res) => {
        return res.data;
      });
  };
};

type HookProps = {
  uuid?: string;
};

export const useUpdateUser = ({ uuid }: HookProps) => {
  return useMutation<ApiResponse<{ user: User }>, Error, ProfileFormRequest>(
    updateUser({ uuid }),
    {
      mutationKey: [UPDATE_USER_MUTATION_KEY],
    },
  );
};
