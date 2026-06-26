import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/routes.constants";
import { NoticeRow, Root, SettingsLink } from "./credit-limit-notice.styled";

type CreditLimitNoticeProps = {
  overBudget?: boolean;
  canManageKey: boolean;
  resetIn?: string | null;
};

export const CreditLimitNotice: React.FC<CreditLimitNoticeProps> = ({
  overBudget = true,
  canManageKey,
  resetIn,
}) => {
  const { t } = useTranslation();

  if (!overBudget) {
    return null;
  }

  return (
    <NoticeRow>
      {canManageKey ? (
        <Root>
          <span>{t("components.credit_limit_notice.over_credits")}</span>
          <SettingsLink to={ROUTES.MY_PROFILE}>
            {t("components.credit_limit_notice.add_key")}
            <ArrowRight size={13} aria-hidden />
          </SettingsLink>
        </Root>
      ) : (
        <Root>
          <span>{t("components.credit_limit_notice.out_of_credits")}</span>
          {resetIn && (
            <span>
              {t("components.credit_limit_notice.resets_in", { time: resetIn })}
            </span>
          )}
        </Root>
      )}
    </NoticeRow>
  );
};
