import { ProviderName } from "@/types/provider-key.types";

export const providerKeyKeys = {
  all: ["provider-keys"] as const,
  detail: (provider: ProviderName) => ["provider-keys", provider] as const,
};
