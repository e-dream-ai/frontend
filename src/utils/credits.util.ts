import { User } from "@/types/auth.types";

export type DerivedCredits = {
  remainingUsd: number;
  quotaUsd: number;
  pctLeft: number;
  resetAt?: string;
};

export const deriveCredits = (user?: User): DerivedCredits | null => {
  if (!user?.dailyQuotaUsd) return null;
  const quotaUsd = Number(user.dailyQuotaUsd);
  if (!Number.isFinite(quotaUsd) || quotaUsd <= 0) return null;

  const remainingUsd = Math.max(0, Number(user.providerCreditsUsd ?? 0));
  const pctLeft = Math.max(0, Math.min(100, (remainingUsd / quotaUsd) * 100));

  return { remainingUsd, quotaUsd, pctLeft, resetAt: user.creditsResetAt };
};

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatUsd = (value: number): string => usdFormatter.format(value);

export const formatResetIn = (resetAt?: string): string | null => {
  if (!resetAt) return null;
  const diffMs = new Date(resetAt).getTime() - Date.now();
  if (!Number.isFinite(diffMs) || diffMs <= 0) return null;

  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  if (hours >= 1)
    return minutes > 0 ? `${hours}h and ${minutes}m` : `${hours}h`;
  return `${Math.max(1, minutes)}m`;
};
