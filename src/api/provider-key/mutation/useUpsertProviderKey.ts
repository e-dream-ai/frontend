import { useMutation } from "@tanstack/react-query";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import { axiosClient } from "@/client/axios.client";
import queryClient from "@/api/query-client";
import { providerKeyKeys } from "@/api/provider-key/keys";
import { ApiResponse } from "@/types/api.types";
import { ProviderKeyStatus, ProviderName } from "@/types/provider-key.types";

type UpsertProviderKeyParams = { provider: ProviderName; key: string };

const upsertProviderKey = async (params: UpsertProviderKeyParams) => {
  const { data } = await axiosClient.post<
    ApiResponse<{ providerKey: ProviderKeyStatus }>
  >("/v1/provider-keys", params, {
    headers: getRequestHeaders({ contentType: ContentType.json }),
  });
  return data;
};

export const useUpsertProviderKey = () => {
  return useMutation<
    ApiResponse<{ providerKey: ProviderKeyStatus }>,
    Error,
    UpsertProviderKeyParams
  >(upsertProviderKey, {
    mutationKey: ["upsertProviderKey"],
    onSuccess: (_data, { provider }) => {
      queryClient.invalidateQueries(providerKeyKeys.detail(provider));
    },
  });
};
