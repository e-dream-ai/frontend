import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { VerifyEmailRequestValues } from "schemas/verify-email.schema";
import { MutationResponse } from "types/api.types";
import { User } from "types/auth.types";

export const VERIFY_EMAIL_MUTATION_KEY = "verifyEmail";

const verifyEmail = async (params: VerifyEmailRequestValues) => {
  return fetch(`${URL}/auth/code`, {
    method: "post",
    body: JSON.stringify(params),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  }).then((res) => res.json());
};

export const useVerifyEmail = () => {
  return useMutation<MutationResponse<User>, Error, VerifyEmailRequestValues>(
    verifyEmail,
    {
      mutationKey: [VERIFY_EMAIL_MUTATION_KEY],
    },
  );
};

export default useVerifyEmail;
