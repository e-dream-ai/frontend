import { useTranslation } from "react-i18next";
import { ModelCatalogEntry } from "@/types/model.types";
import { CostParams, estimateUnitCostUsd } from "@/utils/model-cost.util";

type UseCostEstimateArgs = {
  model: ModelCatalogEntry | undefined;
  params: CostParams;
  count: number;
  breakdownKey: string;
};

export const useCostEstimate = ({
  model,
  params,
  count,
  breakdownKey,
}: UseCostEstimateArgs) => {
  const { t } = useTranslation();

  const unitCostUsd = estimateUnitCostUsd(model, params);
  const totalCostUsd =
    unitCostUsd != null && count > 0 ? unitCostUsd * count : null;
  const costBreakdown = count > 1 ? t(breakdownKey, { count }) : undefined;

  return { totalCostUsd, costBreakdown };
};
