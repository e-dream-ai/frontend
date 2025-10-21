/**
 * Hook to use Device Role Context
 */

import { useContext } from "react";
import DeviceRoleContext from "@/context/device-role.context";

const useDeviceRole = () => {
  const context = useContext(DeviceRoleContext);

  if (!context) {
    throw new Error("useDeviceRole must be used within DeviceRoleProvider");
  }

  return context;
};

export default useDeviceRole;
