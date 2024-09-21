import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { SignupRequestValues } from "@/schemas/signup.schema";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";

export const SIGNUP_MUTATION_KEY = "signup";

const signup = async (values: SignupRequestValues) => {
  return axiosClient
    .post(`/v2/auth/signup`, values, {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    })
    .then((res) => {
      const data = res.data;

      if (data.success) {
        await axiosClient.post(`/v2/auth/login`, values, {
          headers: getRequestHeaders({
            contentType: ContentType.json,
          }),
        })
      }

      return data
    });
};

export const useSignup = () => {
  return useMutation<ApiResponse<object>, Error, SignupRequestValues>(signup, {
    mutationKey: [SIGNUP_MUTATION_KEY],
  });
};

export default useSignup;
