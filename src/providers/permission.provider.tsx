import PermissionContext from "context/permission.context";
import useAuth from "hooks/useAuth";
import React from "react";
import { Permission, RoleType } from "types/role.types";
import { getRolePermissions } from "utils/permissions.util";

type Props = {
  children?: React.ReactNode;
};

/**
 *  Receive user permissions as parameter
 */
const PermissionProvider: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();
  const permissions: Permission[] = getRolePermissions(
    user?.role?.name as RoleType,
  );

  /**
   *  Verify if requested permission is available in array of user permissions
   */
  const isAllowedTo = (props: {
    permission: Permission;
    isOwner?: boolean;
  }) => {
    if (props.isOwner) return true;
    return permissions.includes(props.permission);
  };

  /**
   *  Component will render its children wrapped around a PermissionContext's provide
   */
  return (
    <PermissionContext.Provider value={{ isAllowedTo }}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionProvider;
