export type ProviderName = "fal";

export type ProviderKeyStatus = {
  provider: ProviderName;
  isValid: boolean;
  lastValidatedAt: string | null;
};
