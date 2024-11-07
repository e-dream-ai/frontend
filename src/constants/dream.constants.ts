import { TFunction } from "i18next";

export const NSFW = {
  TRUE: "true",
  FALSE: "false",
};

export const getNsfwOptions = (t: TFunction) => [
  { value: NSFW.TRUE, label: t("user.nsfw.nsfw") },
  { value: NSFW.FALSE, label: t("user.nsfw.sfw") },
];

export const getCcaLicenceOptions = (t: TFunction) => [
  { value: NSFW.TRUE, label: t("dream.cca_license.active") },
  { value: NSFW.FALSE, label: t("dream.cca_license.inactive") },
];

export const filterNsfwOption = (value: boolean = false, t: TFunction) =>
  getNsfwOptions(t).find(
    (option) => option.value === Boolean(value).toString(),
  ) ?? { value: NSFW.FALSE, label: t("user.nsfw.sfw") };
