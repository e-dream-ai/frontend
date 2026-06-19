import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import type { ApiResponse } from "@/types/api.types";
import type {
  UserApiEndpoint,
  UpdateUserApiEndpointParams,
} from "@/types/user-api-endpoint.types";
import { USER_API_ENDPOINTS_QUERY_KEY } from "./useUserApiEndpoints";

const updateEndpoint = async ({
  uuid,
  ...params
}: UpdateUserApiEndpointParams) => {
  const { data } = await axiosClient.put<
    ApiResponse<{ endpoint: UserApiEndpoint }>
  >(`/v1/user/api-endpoints/${uuid}`, params, {
    headers: getRequestHeaders({ contentType: ContentType.json }),
  });
  return data;
};

export const useUpdateUserApiEndpoint = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<{ endpoint: UserApiEndpoint }>,
    Error,
    UpdateUserApiEndpointParams
  >(updateEndpoint, {
    mutationKey: ["updateUserApiEndpoint"],
    onSuccess: () => {
      queryClient.invalidateQueries([USER_API_ENDPOINTS_QUERY_KEY]);
    },
  });
};
