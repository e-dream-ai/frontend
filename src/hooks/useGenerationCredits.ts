import useAuth from "@/hooks/useAuth";
import usePermission from "@/hooks/usePermission";
import { useUser } from "@/api/user/query/useUser";
import { useProviderKey } from "@/api/provider-key/query/useProviderKey";
import { PROFILE_PERMISSIONS } from "@/constants/permissions.constants";
import { deriveCredits, formatResetIn } from "@/utils/credits.util";

export const useGenerationCredits = () => {
  const { user: authUser } = useAuth();
  const canManageKey = usePermission({
    permission: PROFILE_PERMISSIONS.CAN_MANAGE_PROVIDER_KEY,
  });
  const { data: userData } = useUser({
    uuid: authUser?.uuid,
    enabled: canManageKey,
  });
  const { data: keyData } = useProviderKey("fal", canManageKey);

  const credits = deriveCredits(userData?.data?.user);
  const remainingUsd = credits?.remainingUsd ?? null;
  const hasValidKey = keyData?.data?.providerKey?.isValid === true;
  const resetIn = formatResetIn(credits?.resetAt);

  const isBlocked = (totalCostUsd: number | null): boolean =>
    totalCostUsd != null &&
    remainingUsd != null &&
    totalCostUsd > remainingUsd &&
    !hasValidKey;

  return { remainingUsd, hasValidKey, canManageKey, resetIn, isBlocked };
};
