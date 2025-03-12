import {
  getUserFeedFilterData,
  USER_FEED_FILTERS_NAMES,
} from "@/constants/feed.constants";
import { USER_FEED_PERMISSIONS } from "@/constants/permissions.constants";
import useAuth from "@/hooks/useAuth";
import usePermission from "@/hooks/usePermission";
import { isAdmin } from "@/utils/user.util";
import { useTranslation } from "react-i18next";

export const useUserFeedFilter = (isOwner: boolean) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isUserAdmin = isAdmin(user);

  const allowedViewHidden = usePermission({
    permission: USER_FEED_PERMISSIONS.CAN_VIEW_HIDDEN,
    isOwner: isOwner,
  });

  const data = getUserFeedFilterData(t);

  const filteredData =
    isUserAdmin || allowedViewHidden
      ? data
      : data.filter(
          (option) => option.key !== t(USER_FEED_FILTERS_NAMES.HIDDEN),
        );

  return filteredData;
};
