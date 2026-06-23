import { ContentType, getRequestHeaders } from "@/constants/auth.constants";
import useApiQuery from "@/api/shared/useApiQuery";
import { providerKeyKeys } from "@/api/provider-key/keys";
import { ProviderKeyStatus, ProviderName } from "@/types/provider-key.types";

type ProviderKeyResponse = { providerKey: ProviderKeyStatus | null };

const FIVE_MINUTES = 5 * 60 * 1000;

export const useProviderKey = (provider: ProviderName, enabled = true) => {
  return useApiQuery<ProviderKeyResponse>(
    providerKeyKeys.detail(provider),
    `/v1/provider-keys?provider=${provider}`,
    {
      headers: getRequestHeaders({ contentType: ContentType.json }),
    },
    {},
    { staleTime: FIVE_MINUTES, enabled },
  );
};
