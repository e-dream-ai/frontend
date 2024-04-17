import { RoleType } from "@/types/role.types";

export const ROLES: {
  USER_GROUP: RoleType;
  ADMIN_GROUP: RoleType;
  CREATOR_GROUP: RoleType;
} = {
  USER_GROUP: "user-group",
  ADMIN_GROUP: "admin-group",
  CREATOR_GROUP: "creator-group",
};

export const ROLES_NAMES = {
  [ROLES.USER_GROUP]: "roles.user_group",
  [ROLES.ADMIN_GROUP]: "roles.admin_group",
  [ROLES.CREATOR_GROUP]: "roles.creator_group",
};
