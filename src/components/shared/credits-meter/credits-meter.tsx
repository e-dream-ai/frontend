import { useTranslation } from "react-i18next";
import { User } from "@/types/auth.types";
import { deriveCredits, formatResetIn, formatUsd } from "@/utils/credits.util";
import {
  Amount,
  Fill,
  Label,
  LOW_THRESHOLD,
  SubText,
  TopRow,
  Track,
  Wrapper,
} from "./credits-meter.styled";

type CreditsMeterProps = {
  user?: User;
  compact?: boolean;
};

export const CreditsMeter: React.FC<CreditsMeterProps> = ({
  user,
  compact,
}) => {
  const { t } = useTranslation();
  const credits = deriveCredits(user);

  if (!credits) return null;

  const { remainingUsd, quotaUsd, pctLeft, resetAt } = credits;
  const isEmpty = pctLeft <= 0;
  const isLow = pctLeft <= LOW_THRESHOLD;
  const resetIn = formatResetIn(resetAt);

  return (
    <Wrapper
      $compact={compact}
      aria-label={t("components.credits_meter.label")}
    >
      <TopRow>
        <Label $compact={compact}>{t("components.credits_meter.label")}</Label>
        <Amount $compact={compact} $low={isLow}>
          {compact
            ? t("components.credits_meter.amount_left", {
                amount: formatUsd(remainingUsd),
              })
            : `${formatUsd(remainingUsd)} / ${formatUsd(quotaUsd)}`}
        </Amount>
      </TopRow>

      <Track
        $compact={compact}
        role="progressbar"
        aria-valuenow={Math.round(pctLeft)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <Fill $pct={pctLeft} $low={isLow} />
      </Track>

      {!compact &&
        (isEmpty ? (
          <SubText $low>{t("components.credits_meter.depleted")}</SubText>
        ) : (
          resetIn && (
            <SubText>
              {t("components.credits_meter.resets_in", { time: resetIn })}
            </SubText>
          )
        ))}
    </Wrapper>
  );
};
