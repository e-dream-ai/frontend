/**
 * Device Role Context
 * Manages device identity and role assignment for multi-device coordination
 */

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import useSocket from "@/hooks/useSocket";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import { DEVICE_EVENTS } from "@/constants/remote-control.constants";
import {
  DeviceRole,
  DeviceRoleAssignment,
  DeviceListUpdate,
  ConnectedDevice,
  DeviceInfo,
} from "@/types/device-role.types";
import { detectDevice } from "@/utils/device-detection.util";
import { getDeviceId, getDeviceName } from "@/utils/device-identity.util";

type DeviceRoleContextType = {
  deviceInfo: DeviceInfo | null;
  currentRole: DeviceRole;
  isRoleAssigned: boolean;
  connectedDevices: ConnectedDevice[];
  shouldShowVideoPlayer: boolean;
  shouldShowRemoteControls: boolean;
  registerDevice: () => void;
};

const DeviceRoleContext = createContext<DeviceRoleContextType | undefined>(
  undefined,
);

export const DeviceRoleProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { emit, isConnected } = useSocket();

  // Device information
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [currentRole, setCurrentRole] = useState<DeviceRole>(
    DeviceRole.SELF_REMOTE,
  );
  const [isRoleAssigned, setIsRoleAssigned] = useState<boolean>(false);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>(
    [],
  );

  /**
   * Initialize device info on mount
   */
  useEffect(() => {
    const detected = detectDevice();
    const deviceId = getDeviceId();
    const deviceName = getDeviceName();

    const info: DeviceInfo = {
      deviceId,
      deviceType: detected.type,
      deviceName,
      isTouchDevice: detected.isTouchDevice,
      screenWidth: detected.screenWidth,
      screenHeight: detected.screenHeight,
      pixelRatio: detected.pixelRatio,
      userAgent: detected.userAgent,
    };

    setDeviceInfo(info);
    console.log("Device detected:", info);
  }, []);

  /**
   * Register device with backend when socket connects and device info is available
   */
  const registerDevice = useCallback(() => {
    if (!deviceInfo || !isConnected) {
      return;
    }

    console.log("Registering device:", deviceInfo);

    emit(DEVICE_EVENTS.DEVICE_REGISTER, {
      deviceId: deviceInfo.deviceId,
      deviceType: deviceInfo.deviceType,
      deviceName: deviceInfo.deviceName,
      isTouchDevice: deviceInfo.isTouchDevice,
      screenWidth: deviceInfo.screenWidth,
      screenHeight: deviceInfo.screenHeight,
      pixelRatio: deviceInfo.pixelRatio,
      userAgent: deviceInfo.userAgent,
    });
  }, [deviceInfo, isConnected, emit]);

  /**
   * Auto-register when socket connects and device info is ready
   */
  useEffect(() => {
    if (deviceInfo && isConnected) {
      registerDevice();
    }
  }, [deviceInfo, isConnected, registerDevice]);

  /**
   * Listen for role assignment from backend
   */
  useSocketEventListener<DeviceRoleAssignment>(
    DEVICE_EVENTS.ROLE_ASSIGNED,
    async (data?: DeviceRoleAssignment) => {
      if (!data || !deviceInfo) {
        return;
      }

      // Only update if this assignment is for current device
      if (data.deviceId === deviceInfo.deviceId) {
        console.log("Role assigned:", data.role, "Reason:", data.reason);
        setCurrentRole(data.role);
        setIsRoleAssigned(true);
      }
    },
  );

  /**
   * Listen for device list updates from backend
   */
  useSocketEventListener<DeviceListUpdate>(
    DEVICE_EVENTS.LIST_UPDATED,
    async (data?: DeviceListUpdate) => {
      if (!data) {
        return;
      }

      console.log("Device list updated:", data.devices);
      setConnectedDevices(data.devices);
    },
  );

  /**
   * Send periodic pings to maintain device session
   */
  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const pingInterval = setInterval(() => {
      emit(DEVICE_EVENTS.PING);
    }, 30000); // 30 seconds

    return () => {
      clearInterval(pingInterval);
    };
  }, [isConnected, emit]);

  /**
   * Reset role assignment when socket disconnects
   */
  useEffect(() => {
    if (!isConnected) {
      setIsRoleAssigned(false);
      setCurrentRole(DeviceRole.SELF_REMOTE);
      setConnectedDevices([]);
    }
  }, [isConnected]);

  /**
   * Computed properties for UI rendering
   */
  const hasOtherRemote = useMemo(() => {
    return connectedDevices.some(
      (d) => d.role === DeviceRole.REMOTE && !d.isCurrentDevice,
    );
  }, [connectedDevices]);

  const shouldShowVideoPlayer = useMemo(() => {
    return (
      currentRole === DeviceRole.SELF_REMOTE ||
      currentRole === DeviceRole.PLAYER
    );
  }, [currentRole]);

  const shouldShowRemoteControls = useMemo(() => {
    if (currentRole === DeviceRole.REMOTE) return true;
    if (currentRole === DeviceRole.SELF_REMOTE && !hasOtherRemote) return true;
    return false;
  }, [currentRole, hasOtherRemote]);

  const memoedValue = useMemo(
    () => ({
      deviceInfo,
      currentRole,
      isRoleAssigned,
      connectedDevices,
      shouldShowVideoPlayer,
      shouldShowRemoteControls,
      registerDevice,
    }),
    [
      deviceInfo,
      currentRole,
      isRoleAssigned,
      connectedDevices,
      shouldShowVideoPlayer,
      shouldShowRemoteControls,
      registerDevice,
    ],
  );

  return (
    <DeviceRoleContext.Provider value={memoedValue}>
      {children}
    </DeviceRoleContext.Provider>
  );
};

export default DeviceRoleContext;
