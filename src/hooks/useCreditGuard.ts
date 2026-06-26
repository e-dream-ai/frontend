import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useGenerationCredits } from "@/hooks/useGenerationCredits";

export const useCreditGuard = (totalCostUsd: number | null) => {
  const { t } = useTranslation();
  const { isBlocked, canManageKey, resetIn } = useGenerationCredits();
  const overBudget = isBlocked(totalCostUsd);

  const guardOverBudget = useCallback((): boolean => {
    if (overBudget) {
      toast.error(t("components.credit_limit_notice.over_credits"));
      return true;
    }
    return false;
  }, [overBudget, t]);

  return { overBudget, canManageKey, resetIn, guardOverBudget };
};
