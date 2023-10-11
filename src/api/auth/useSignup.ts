import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { SignupRequestValues } from "schemas/signup.schema";
import { ApiResponse } from "types/api.types";

export const SIGNUP_MUTATION_KEY = "signup";

const signup = async (params: SignupRequestValues) => {
  return fetch(`${URL}/auth/signup`, {
    method: "post",
    body: JSON.stringify(params),
    headers: getRequestHeaders({
      contentType: ContentType.json,
    }),
  }).then((res) => {
    return res.json();
  });
};

export const useSignup = () => {
  return useMutation<ApiResponse<object>, Error, SignupRequestValues>(signup, {
    mutationKey: [SIGNUP_MUTATION_KEY],
  });
};

export default useSignup;
