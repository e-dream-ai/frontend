import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ProfileFormValues } from "@/schemas/profile.schema";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const UPDATE_USER_MUTATION_KEY = "updateUser";

const updateUser = ({ id }: { id?: number }) => {
  return async (params: ProfileFormValues) => {
    return axiosClient
      .put(`/user/${id}`, params, {
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
  id?: number;
};

export const useUpdateUser = ({ id }: HookProps) => {
  return useMutation<ApiResponse<{ user: User }>, Error, ProfileFormValues>(
    updateUser({ id }),
    {
      mutationKey: [UPDATE_USER_MUTATION_KEY],
    },
  );
};
