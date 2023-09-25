import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { LoginFormValues } from "schemas/login.schema";
import { MutationResponse } from "types/api.types";
import { User } from "types/auth.types";

export const LOGIN_MUTATION_KEY = "login";

const login = async (params: LoginFormValues) => {
  return fetch(`${URL}/auth/login`, {
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

export const useLogin = () => {
  return useMutation<MutationResponse<User>, Error, LoginFormValues>(login, {
    mutationKey: [LOGIN_MUTATION_KEY],
  });
};

export default useLogin;
