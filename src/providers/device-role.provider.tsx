/**
 * Device Role Provider wrapper
 */

import { DeviceRoleProvider as DeviceRoleContextProvider } from "@/context/device-role.context";

const DeviceRoleProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return <DeviceRoleContextProvider>{children}</DeviceRoleContextProvider>;
};

export default DeviceRoleProvider;
