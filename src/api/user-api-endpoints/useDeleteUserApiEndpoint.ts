import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import type { ApiResponse } from "@/types/api.types";
import { USER_API_ENDPOINTS_QUERY_KEY } from "./useUserApiEndpoints";

const deleteEndpoint = async (uuid: string) => {
  const { data } = await axiosClient.delete<ApiResponse<null>>(
    `/v1/user/api-endpoints/${uuid}`,
    { headers: getRequestHeaders({ contentType: ContentType.json }) },
  );
  return data;
};

export const useDeleteUserApiEndpoint = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<null>, Error, string>(deleteEndpoint, {
    mutationKey: ["deleteUserApiEndpoint"],
    onSuccess: () => {
      queryClient.invalidateQueries([USER_API_ENDPOINTS_QUERY_KEY]);
    },
  });
};
