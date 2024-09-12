import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ForgotPasswordFormValues } from "@/schemas/forgot-password.schema";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const FORGOT_PASSWORD_MUTATION_KEY = "forgotPassword";

const forgotPassword = async (values: ForgotPasswordFormValues) => {
  return axiosClient
    .post(`/v1/auth/forgot-password`, values, {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    })
    .then((res) => {
      return res.data;
    });
};

export const useForgotPassword = () => {
  return useMutation<ApiResponse<User>, Error, ForgotPasswordFormValues>(
    forgotPassword,
    {
      mutationKey: [FORGOT_PASSWORD_MUTATION_KEY],
    },
  );
};

export default useForgotPassword;
