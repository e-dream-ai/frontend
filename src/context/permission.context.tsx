import React from "react";
import { Permission } from "types/role.types";

type PermissionContextType = {
  isAllowedTo: (props: {
    permission: Permission;
    isOwner?: boolean;
  }) => boolean;
};

// Default behaviour for the Permission Provider Context
const defaultBehaviour: PermissionContextType = {
  isAllowedTo: () => false,
};

// Create context
const PermissionContext =
  React.createContext<PermissionContextType>(defaultBehaviour);

export default PermissionContext;
