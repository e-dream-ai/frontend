import { useQuery } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useAuth from "@/hooks/useAuth";
import { ApiResponse } from "@/types/api.types";
import { User } from "@/types/auth.types";
import { axiosClient } from "@/client/axios.client";

export const CURRENT_USER_QUERY_KEY = "getCurrentUser";

const getCurrentUser = () => {
  return async () =>
    axiosClient
      .get(`/user/current`, {
        headers: getRequestHeaders({
          contentType: ContentType.json,
        }),
      })
      .then((res) => res.data);
};

export const useCurrentUser = () => {
  const { user } = useAuth();
  return useQuery<ApiResponse<{ user: User }>, Error>(
    [CURRENT_USER_QUERY_KEY],
    getCurrentUser(),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(user),
    },
  );
};
