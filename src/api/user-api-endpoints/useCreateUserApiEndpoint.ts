import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  UserApiEndpoint,
  CreateUserApiEndpointParams,
} from "@/types/user-api-endpoint.types";
import { USER_API_ENDPOINTS_QUERY_KEY } from "./useUserApiEndpoints";

const createEndpoint = async (params: CreateUserApiEndpointParams) => {
  const { data } = await axiosClient.post<
    ApiResponse<{ endpoint: UserApiEndpoint }>
  >("/v1/user/api-endpoints", params, {
    headers: getRequestHeaders({ contentType: ContentType.json }),
  });
  return data;
};

export const useCreateUserApiEndpoint = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<{ endpoint: UserApiEndpoint }>,
    Error,
    CreateUserApiEndpointParams
  >(createEndpoint, {
    mutationKey: ["createUserApiEndpoint"],
    onSuccess: () => {
      queryClient.invalidateQueries([USER_API_ENDPOINTS_QUERY_KEY]);
    },
  });
};
