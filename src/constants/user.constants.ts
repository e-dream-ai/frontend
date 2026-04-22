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

export const ENABLE_CREATING_PROPRIETARY_DREAMS = {
  TRUE: "true",
  FALSE: "false",
};

export const getEnableCreatingProprietaryDreamsOptions = (t: TFunction) => [
  {
    value: ENABLE_CREATING_PROPRIETARY_DREAMS.TRUE,
    label: t("user.enable_creating_proprietary_dreams.active"),
  },
  {
    value: ENABLE_CREATING_PROPRIETARY_DREAMS.FALSE,
    label: t("user.enable_creating_proprietary_dreams.inactive"),
  },
];

export const filterEnableCreatingProprietaryDreamsOption = (
  value: boolean = false,
  t: TFunction,
) =>
  getEnableCreatingProprietaryDreamsOptions(t).find(
    (option) => option.value === Boolean(value).toString(),
  ) ?? {
    value: ENABLE_CREATING_PROPRIETARY_DREAMS.FALSE,
    label: t("user.enable_creating_proprietary_dreams.inactive"),
  };
