import { ROLE_PERMISSIONS } from "@/constants/permissions.constants";
import { ROLES } from "@/constants/role.constants";
import { Permission, RoleType } from "@/types/role.types";

export const getRolePermissions = (role?: RoleType): Permission[] => {
  if (role === ROLES.ADMIN_GROUP) return ROLE_PERMISSIONS[ROLES.ADMIN_GROUP];
  else if (role === ROLES.USER_GROUP) return ROLE_PERMISSIONS[ROLES.USER_GROUP];
  return [];
};
