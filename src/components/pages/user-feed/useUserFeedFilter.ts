import {
  getUserFeedFilterData,
  USER_FEED_TYPES,
} from "@/constants/feed.constants";
import useAuth from "@/hooks/useAuth";
import { isAdmin } from "@/utils/user.util";
import { useTranslation } from "react-i18next";

export const useUserFeedFilter = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isUserAdmin = isAdmin(user);

  const data = getUserFeedFilterData(t);

  if (isUserAdmin) {
    return data;
  }

  return data.filter((option) => option.value !== USER_FEED_TYPES.HIDDEN);
};
