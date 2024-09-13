import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";
import { AuthenticateValues } from "@/schemas/authenticate.schema";

export const AUTHENTICATE_MUTATION_KEY = "authenticate";

const authenticate = async (values: AuthenticateValues) => {
  return axiosClient
    .get(`/v2/auth/callback`, {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
      params: {
        code: values.code,
      },
    })
    .then((res) => {
      return res.data;
    });
};

export const useAuthenticate = () => {
  return useMutation<ApiResponse<User>, Error, AuthenticateValues>(
    authenticate,
    {
      mutationKey: [AUTHENTICATE_MUTATION_KEY],
    },
  );
};

export default useAuthenticate;
