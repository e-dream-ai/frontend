import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { LogoutRequestValues } from "@/schemas/logout.schema";
import { ApiResponse } from "@/types/api.types";
import { axiosClient } from "@/client/axios.client";

export const LOGOUT_MUTATION_KEY = "logout";

const logout = async (values: LogoutRequestValues) => {
  return axiosClient
    .post(`/v2/auth/logout`, values, {
      headers: getRequestHeaders({
        contentType: ContentType.json,
      }),
      validateStatus: (status) => status >= 200 && status < 303, // Consider 302 as success on logout redirection
    })
    .then((res) => {
      return res.data;
    });
};

export const useLogout = () => {
  return useMutation<ApiResponse<unknown>, Error, LogoutRequestValues>(logout, {
    mutationKey: [LOGOUT_MUTATION_KEY],
  });
};

export default useLogout;
