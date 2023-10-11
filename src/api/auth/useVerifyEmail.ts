import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { VerifyEmailRequestValues } from "schemas/verify-email.schema";
import { ApiResponse } from "types/api.types";
import { User } from "types/auth.types";

export const VERIFY_EMAIL_MUTATION_KEY = "verifyEmail";

const verifyEmail = async (params: VerifyEmailRequestValues) => {
  return fetch(`${URL}/auth/code`, {
    method: "post",
    body: JSON.stringify(params),
    headers: getRequestHeaders({
      contentType: ContentType.json,
    }),
  }).then((res) => {
    return res.json();
  });
};

export const useVerifyEmail = () => {
  return useMutation<ApiResponse<User>, Error, VerifyEmailRequestValues>(
    verifyEmail,
    {
      mutationKey: [VERIFY_EMAIL_MUTATION_KEY],
    },
  );
};

export default useVerifyEmail;
