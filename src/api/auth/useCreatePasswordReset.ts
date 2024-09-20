import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { CreatePasswordResetFormValues } from "@/schemas/forgot-password.schema";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const CREATE_PASSWORD_RESET_MUTATION_KEY = "createPasswordReset";

const createPasswordReset = async (values: CreatePasswordResetFormValues) => {
  return axiosClient
    .post(`/v2/auth/create-password-reset`, values, {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    })
    .then((res) => {
      return res.data;
    });
};

export const useCreatePasswordReset = () => {
  return useMutation<ApiResponse<User>, Error, CreatePasswordResetFormValues>(
    createPasswordReset,
    {
      mutationKey: [CREATE_PASSWORD_RESET_MUTATION_KEY],
    },
  );
};

export default useCreatePasswordReset;
