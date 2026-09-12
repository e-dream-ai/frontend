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
export const isAdmin = (user?: User | null): boolean =>
  user?.role?.name === ROLES.ADMIN_GROUP;

export const formatRoleName = (name?: string) => name?.replace("-group", "");

/**
 * Checks if the user has opted into NSFW content in their profile.
 * Users who have not opted in are never asked to rate their own uploads.
 * @param user The user object to check.
 * @returns True if the user has opted into NSFW content, false otherwise.
 */
export const hasOptedIntoNsfw = (user?: User | null): boolean =>
  Boolean(user?.nsfw);
