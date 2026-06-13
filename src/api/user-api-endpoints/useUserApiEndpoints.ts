import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import type { ApiResponse } from "@/types/api.types";
import type { UserApiEndpoint } from "@/types/user-api-endpoint.types";
import useAuth from "@/hooks/useAuth";

export const USER_API_ENDPOINTS_QUERY_KEY = "userApiEndpoints";

const getEndpoints = () => {
  return async () =>
    axiosClient
      .get("/v1/user/api-endpoints", {
        headers: getRequestHeaders({ contentType: ContentType.json }),
      })
      .then((res) => res.data);
};

export const useUserApiEndpoints = () => {
  const { user } = useAuth();
  return useQuery<ApiResponse<{ endpoints: UserApiEndpoint[] }>, Error>(
    [USER_API_ENDPOINTS_QUERY_KEY],
    getEndpoints(),
    { enabled: Boolean(user) },
  );
};
