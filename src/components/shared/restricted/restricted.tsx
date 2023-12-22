import usePermission from "@/hooks/usePermission";
import React from "react";
import { Permission } from "@/types/role.types";

type Props = {
  to: Permission;
  fallback?: JSX.Element | string;
  children?: React.ReactNode;
  isOwner?: boolean;
};

/**
 *  Use component everywhere a restriction based on user permission is needed
 */
const Restricted: React.FC<Props> = ({ to, isOwner, fallback, children }) => {
  const allowed = usePermission({ permission: to, isOwner });

  /**
   *  If user has permission, render children components
   */
  if (allowed) {
    return <>{children}</>;
  }

  /**
   *  Render fallback
   */
  return <>{fallback}</>;
};

export default Restricted;
