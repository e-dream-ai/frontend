import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { ForgotPasswordFormValues } from "schemas/forgot-password.schema";
import { ApiResponse } from "types/api.types";
import { User } from "types/auth.types";

export const FORGOT_PASSWORD_MUTATION_KEY = "forgotPassword";

const forgotPassowrd = async (params: ForgotPasswordFormValues) => {
  return fetch(`${URL}/auth/forgot-password`, {
    method: "post",
    body: JSON.stringify(params),
    headers: getRequestHeaders({
      contentType: ContentType.json,
    }),
  }).then((res) => {
    return res.json();
  });
};

export const useForgotPassword = () => {
  return useMutation<ApiResponse<User>, Error, ForgotPasswordFormValues>(
    forgotPassowrd,
    {
      mutationKey: [FORGOT_PASSWORD_MUTATION_KEY],
    },
  );
};

export default useForgotPassword;
