import { useMutation } from "@tanstack/react-query";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { LoginFormValues } from "schemas/login.schema";
import { ApiResponse } from "types/api.types";
import { User } from "types/auth.types";

export const LOGIN_MUTATION_KEY = "login";

const login = async (params: LoginFormValues) => {
  return fetch(`${URL}/auth/login`, {
    method: "post",
    body: JSON.stringify(params),
    headers: getRequestHeaders({
      contentType: ContentType.json,
    }),
  }).then((res) => {
    return res.json();
  });
};

export const useLogin = () => {
  return useMutation<ApiResponse<User>, Error, LoginFormValues>(login, {
    mutationKey: [LOGIN_MUTATION_KEY],
  });
};

export default useLogin;
