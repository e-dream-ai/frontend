import { useTranslation } from "react-i18next";
import { useWindowSize } from "./useWindowSize";
import { DEVICES_ON_PX } from "@/constants/devices.constants";

export const usePaginateProps = () => {
  const { width } = useWindowSize();
  const { t } = useTranslation();

  /**
   * Reduce displayed margin pages and page range for mobile devices
   */
  const marginPagesDisplayed = (width ?? 0) > DEVICES_ON_PX.MOBILE_L ? 5 : 0;
  const pageRangeDisplayed = (width ?? 0) > DEVICES_ON_PX.MOBILE_L ? 2 : 0;
  const previousLabel = `< ${t("components.paginate.previous")}`;
  const nextLabel = `${t("components.paginate.next")} >`;

  return {
    marginPagesDisplayed,
    pageRangeDisplayed,
    breakLabel: "...",
    previousLabel,
    nextLabel,
    renderOnZeroPageCount: null,
  };
};
