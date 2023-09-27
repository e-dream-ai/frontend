import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { ForgotPasswordFormValues } from "schemas/forgot-password.schema";
import { MutationResponse } from "types/api.types";
import { User } from "types/auth.types";

export const LOGIN_MUTATION_KEY = "login";

const forgotPassowrd = async (params: ForgotPasswordFormValues) => {
  return fetch(`${URL}/auth/forgot-password`, {
    method: "post",
    body: JSON.stringify(params),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  }).then((res) => {
    return res.json();
  });
};

export const useForgotPassword = () => {
  return useMutation<MutationResponse<User>, Error, ForgotPasswordFormValues>(
    forgotPassowrd,
    {
      mutationKey: [LOGIN_MUTATION_KEY],
    },
  );
};

export default useForgotPassword;
