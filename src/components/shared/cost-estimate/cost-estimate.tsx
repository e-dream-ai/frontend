import { useTranslation } from "react-i18next";
import { formatCostUsd } from "@/utils/model-cost.util";
import {
  Amount,
  Breakdown,
  Label,
  Root,
  ValueRow,
} from "./cost-estimate.styled";

type CostEstimateProps = {
  amountUsd: number | null;
  breakdown?: string;
};

export const CostEstimate: React.FC<CostEstimateProps> = ({
  amountUsd,
  breakdown,
}) => {
  const { t } = useTranslation();

  if (amountUsd == null) return null;

  return (
    <Root>
      <Label>{t("components.cost_estimate.label")}</Label>
      <ValueRow>
        <Amount>{formatCostUsd(amountUsd)}</Amount>
        {breakdown && <Breakdown>{breakdown}</Breakdown>}
      </ValueRow>
    </Root>
  );
};
