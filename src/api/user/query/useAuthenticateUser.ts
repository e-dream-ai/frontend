import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const AUTHENTICATE_USER_QUERY_KEY = "getAuthenticatedUser";

const getAuthenticatedUser = () => {
  return async () =>
    axiosClient
      .get(`/v2/auth/authenticate`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

export const useAuthenticateUser = () => {
  return useQuery<ApiResponse<{ user: User }>, Error>(
    [AUTHENTICATE_USER_QUERY_KEY],
    getAuthenticatedUser(),
    {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      enabled: false,
    },
  );
};
