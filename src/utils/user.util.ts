import { ROLES } from "@/constants/role.constants";
import { User } from "@/types/auth.types";

export const getUserName = (user?: Omit<User, "token">) => user?.name || "-";

export const getUserEmail = (user?: Omit<User, "token">) => user?.email || "-";

export const getUserNameOrEmail = (user?: Omit<User, "token">) =>
  user?.name || user?.email || "-";

/**
 * Checks if the given user is an admin.
 * @param user The user object to check.
 * @returns True if the user is an admin, false otherwise.
 */
export const isAdmin = (user?: User): boolean =>
  user?.role?.name === ROLES.ADMIN_GROUP;
