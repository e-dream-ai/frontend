import { ROUTES } from "@/constants/routes.constants";
import { User } from "@/types/auth.types";

// join paths fn
export const joinPaths = (paths: string[]) => {
  return (
    paths
      // remove leading and trailing slashes
      .map((path) => path?.replace(/^\/|\/$/g, ""))
      // remove empty segments
      .filter(Boolean)
      .join("/")
  );
};

export const getUserProfileRoute = (user?: User) => {
  return user?.uuid && `${ROUTES.PROFILE}/${user.uuid}`;
};

export const getDisplayedOwnerProfileRoute = (
  isAdmin: boolean,
  user?: User,
  displayedOwner?: User,
) => {
  // always navigate to user for admins
  // for normal users navigate to 'displayed owner' or user instead

  if (isAdmin) {
    return displayedOwner && `${ROUTES.PROFILE}/${displayedOwner?.uuid}`;
  }

  return displayedOwner?.uuid
    ? `${ROUTES.PROFILE}/${displayedOwner?.uuid}`
    : `${ROUTES.PROFILE}/${user?.uuid}`;
};
