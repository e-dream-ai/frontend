import { TFunction } from "i18next";

export const ENABLE_MARKETING_EMAILS = {
  TRUE: "true",
  FALSE: "false",
};

export const getEnableMarketingEmailsOptions = (t: TFunction) => [
  {
    value: ENABLE_MARKETING_EMAILS.TRUE,
    label: t("user.marketing_emails.active"),
  },
  {
    value: ENABLE_MARKETING_EMAILS.FALSE,
    label: t("user.marketing_emails.inactive"),
  },
];

export const filterMarketingEmailOption = (
  value: boolean = false,
  t: TFunction,
) =>
  getEnableMarketingEmailsOptions(t).find(
    (option) => option.value === Boolean(value).toString(),
  ) ?? {
    value: ENABLE_MARKETING_EMAILS.FALSE,
    label: t("user.marketing_emails.inactive"),
  };
