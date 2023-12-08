import PermissionContext from "context/permission.context";
import { useContext } from "react";
import { Permission } from "types/role.types";

type UsePermissionProps = {
  permission: Permission;
  isOwner?: boolean;
};

const usePermission = ({
  permission,
  isOwner,
}: UsePermissionProps): boolean => {
  const { isAllowedTo } = useContext(PermissionContext);
  return isAllowedTo({ permission, isOwner });
};

export default usePermission;
