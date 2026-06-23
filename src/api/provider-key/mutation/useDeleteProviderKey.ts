import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { axiosClient } from "@/client/axios.client";
import queryClient from "@/api/query-client";
import { providerKeyKeys } from "@/api/provider-key/keys";
import { ApiResponse } from "@/types/api.types";
import { ProviderName } from "@/types/provider-key.types";

const deleteProviderKey = async (provider: ProviderName) => {
  const { data } = await axiosClient.delete<ApiResponse<undefined>>(
    `/v1/provider-keys/${provider}`,
    {
      headers: getRequestHeaders({ contentType: ContentType.json }),
    },
  );
  return data;
};

export const useDeleteProviderKey = () => {
  return useMutation<ApiResponse<undefined>, Error, ProviderName>(
    deleteProviderKey,
    {
      mutationKey: ["deleteProviderKey"],
      onSuccess: (_data, provider) => {
        queryClient.invalidateQueries(providerKeyKeys.detail(provider));
      },
    },
  );
};
