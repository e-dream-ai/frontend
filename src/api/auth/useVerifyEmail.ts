import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { VerifyEmailRequestValues } from "@/schemas/verify-email.schema";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const VERIFY_EMAIL_MUTATION_KEY = "verifyEmail";

const verifyEmail = async (values: VerifyEmailRequestValues) => {
  return axiosClient
    .post(`/auth/code`, values, {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
    })
    .then((res) => {
      return res.data;
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
