import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { ConfirmForgotPasswordRequestValues } from "schemas/confirm-forgot-password.schema";
import { MutationResponse } from "types/api.types";
import { User } from "types/auth.types";

export const CONFIRM_FORGOT_PASSWORD_MUTATION_KEY = "confirmForgotPassword";

const confirmForgotPassowrd = async (
  params: ConfirmForgotPasswordRequestValues,
) => {
  return fetch(`${URL}/auth/confirm-forgot-password`, {
    method: "post",
    body: JSON.stringify(params),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  }).then((res) => {
    return res.json();
  });
};

export const useConfirmForgotPassword = () => {
  return useMutation<
    MutationResponse<User>,
    Error,
    ConfirmForgotPasswordRequestValues
  >(confirmForgotPassowrd, {
    mutationKey: [CONFIRM_FORGOT_PASSWORD_MUTATION_KEY],
  });
};

export default useConfirmForgotPassword;
