import {
  CCA_LICENSE,
  NSFW,
  HIDDEN,
  getCcaLicenceOptions,
  getHiddenOptions,
  getNsfwOptions,
} from "@/constants/select.constants";
import { TFunction } from "i18next";

// get nsfw options for filter
export const filterNsfwOption = (value: boolean = false, t: TFunction) =>
  getNsfwOptions(t).find(
    (option) => option.value === Boolean(value).toString(),
  ) ?? { value: NSFW.FALSE, label: t("user.nsfw.sfw") };

// get nsfw options for filter
export const filterHiddenOption = (value: boolean = false, t: TFunction) =>
  getHiddenOptions(t).find(
    (option) => option.value === Boolean(value).toString(),
  ) ?? { value: HIDDEN.FALSE, label: t("dream.hidden.visible") };

// get ccaLicence options for filter
export const filterCcaLicenceOption = (value: boolean = false, t: TFunction) =>
  getCcaLicenceOptions(t).find(
    (option) => option.value === Boolean(value).toString(),
  ) ?? { value: CCA_LICENSE.FALSE, label: t("dream.ccby_license.inactive") };
