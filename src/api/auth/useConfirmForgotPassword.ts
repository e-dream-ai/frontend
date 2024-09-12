import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ConfirmForgotPasswordRequestValues } from "@/schemas/confirm-forgot-password.schema";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const CONFIRM_FORGOT_PASSWORD_MUTATION_KEY = "confirmForgotPassword";

const confirmForgotPassowrd = async (
  values: ConfirmForgotPasswordRequestValues,
) => {
  return axiosClient
    .post(`/v1/auth/confirm-forgot-password`, values, {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    })
    .then((res) => {
      return res.data;
    });
};

export const useConfirmForgotPassword = () => {
  return useMutation<
    ApiResponse<User>,
    Error,
    ConfirmForgotPasswordRequestValues
  >(confirmForgotPassowrd, {
    mutationKey: [CONFIRM_FORGOT_PASSWORD_MUTATION_KEY],
  });
};

export default useConfirmForgotPassword;
