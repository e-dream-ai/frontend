import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { SignupRequestValues } from "schemas/signup.schema";
import { MutationResponse } from "types/api.types";

export const SIGNUP_MUTATION_KEY = "signup";

const signup = async (params: SignupRequestValues) => {
  return fetch(`${URL}/auth/signup`, {
    method: "post",
    body: JSON.stringify(params),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  }).then((res) => {
    if (!res.ok) {
      throw new Error();
    }
    return res.json();
  });
};

export const useSignup = () => {
  return useMutation<MutationResponse<object>, Error, SignupRequestValues>(
    signup,
    {
      mutationKey: [SIGNUP_MUTATION_KEY],
    },
  );
};

export default useSignup;
