import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { URL } from "constants/api.constants";
import { ContentType, getRequestHeaders } from "constants/auth.constants";
import { LoginFormValues } from "schemas/login.schema";
import { ApiResponse } from "types/api.types";
import { User } from "types/auth.types";

export const LOGIN_MUTATION_KEY = "login";

const login = async (values: LoginFormValues) => {
  return axios
    .post(`${URL}/auth/login`, values, {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    })
    .then((res) => {
      return res.data;
    });
};

export const useLogin = () => {
  return useMutation<ApiResponse<User>, Error, LoginFormValues>(login, {
    mutationKey: [LOGIN_MUTATION_KEY],
  });
};

export default useLogin;
