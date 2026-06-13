import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import type { ApiResponse } from "@/types/api.types";

const testEndpoint = async (uuid: string) => {
  const { data } = await axiosClient.post<ApiResponse<null>>(
    `/v1/user/api-endpoints/${uuid}/test`,
    {},
    { headers: getRequestHeaders({ contentType: ContentType.json }) },
  );
  return data;
};

export const useTestUserApiEndpoint = () => {
  return useMutation<ApiResponse<null>, Error, string>(testEndpoint, {
    mutationKey: ["testUserApiEndpoint"],
  });
};
