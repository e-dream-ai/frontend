import { TFunction } from "i18next";

export const NSFW = {
  TRUE: "true",
  FALSE: "false",
};

export const HIDDEN = {
  TRUE: "true",
  FALSE: "false",
};

export const CCA_LICENSE = {
  TRUE: "true",
  FALSE: "false",
};

export const getNsfwOptions = (t: TFunction) => [
  { value: NSFW.TRUE, label: t("user.nsfw.nsfw") },
  { value: NSFW.FALSE, label: t("user.nsfw.sfw") },
];

export const getHiddenOptions = (t: TFunction) => [
  { value: HIDDEN.TRUE, label: t("dream.hidden.hidden") },
  { value: HIDDEN.FALSE, label: t("dream.hidden.not_hidden") },
];

export const getCcaLicenceOptions = (t: TFunction) => [
  { value: CCA_LICENSE.TRUE, label: t("dream.ccby_license.active") },
  { value: CCA_LICENSE.FALSE, label: t("dream.ccby_license.inactive") },
];
