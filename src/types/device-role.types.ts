/**
 * Device role types for frontend
 */

export enum DeviceType {
  MOBILE = "mobile",
  TABLET = "tablet",
  DESKTOP = "desktop",
}

export enum DeviceRole {
  /**
   * Device acts as both remote control and video player
   */
  SELF_REMOTE = "self-remote",
  /**
   * Device acts only as remote control
   */
  REMOTE = "remote",
  /**
   * Device acts only as video player
   */
  PLAYER = "player",
}

export type DeviceInfo = {
  deviceId: string;
  deviceType: DeviceType;
  deviceName: string;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  userAgent: string;
};

export type DeviceRoleAssignment = {
  deviceId: string;
  role: DeviceRole;
  reason: string;
};

export type ConnectedDevice = {
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  role: DeviceRole;
  isCurrentDevice: boolean;
};

export type DeviceListUpdate = {
  devices: ConnectedDevice[];
};
