import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { SignupRequestValues } from "@/schemas/signup.schema";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";

export const SIGNUP_MUTATION_KEY = "signup";

const signup = async (values: SignupRequestValues) => {
  return axiosClient
    .post(`/v1/auth/signup`, values, {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    })
    .then((res) => {
      return res.data;
    });
};

export const useSignup = () => {
  return useMutation<ApiResponse<object>, Error, SignupRequestValues>(signup, {
    mutationKey: [SIGNUP_MUTATION_KEY],
  });
};

export default useSignup;
