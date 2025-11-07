/**
 * Device detection utility
 * Classifies device types and filters out browser devtools emulation
 */

export enum DeviceType {
  MOBILE = "mobile",
  TABLET = "tablet",
  DESKTOP = "desktop",
}

type DeviceInfo = {
  type: DeviceType;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  userAgent: string;
};

/**
 * Checks if the device has genuine touch capabilities
 */
const hasGenuineTouchCapability = (): boolean => {
  // Check multiple touch indicators
  const hasTouchPoints =
    "maxTouchPoints" in navigator && navigator.maxTouchPoints > 0;
  const hasTouchStart = "ontouchstart" in window;
  const hasTouchEvent = "TouchEvent" in window;

  // Check for coarse pointer (indicates touch)
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  // Multiple signals required to avoid devtools false positives
  return (hasTouchPoints || hasTouchStart || hasTouchEvent) && hasCoarsePointer;
};

/**
 * Detects if running in browser devtools device emulation
 * Uses multiple heuristics to identify emulation
 */
const isDevToolsEmulation = (): boolean => {
  // Check if touch is claimed but pointer is fine (common in devtools)
  const claimsTouch =
    "maxTouchPoints" in navigator && navigator.maxTouchPoints > 0;
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

  if (claimsTouch && hasFinePointer) {
    return true;
  }

  // Check for orientation API inconsistencies
  if ("orientation" in window && typeof window.orientation === "number") {
    // Real mobile devices have orientation, but let's check if it makes sense
    const hasOrientationChange = "onorientationchange" in window;
    if (!hasOrientationChange) {
      return true;
    }
  }

  // Check for missing mobile-specific APIs
  const hasVibration = "vibrate" in navigator;
  const hasBattery = "getBattery" in navigator;

  // If claims to be mobile via UA but missing common mobile APIs
  const mobileUA = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (mobileUA && !hasVibration && !hasBattery) {
    // This could be devtools, but not definitive
    // We'll rely more on pointer type
  }

  // Check screen size vs available screen size
  // Devtools often has inconsistencies here
  if (
    window.screen.width !== window.screen.availWidth ||
    window.screen.height !== window.screen.availHeight
  ) {
    // Could indicate emulation, but not always
  }

  return false;
};

/**
 * Parses user agent to determine device type
 */
const parseUserAgent = (): DeviceType => {
  const ua = navigator.userAgent.toLowerCase();

  // Check for mobile phone patterns
  if (
    /iphone|ipod|android.*mobile|windows phone|blackberry|mini|mobile/i.test(ua)
  ) {
    return DeviceType.MOBILE;
  }

  // Check for tablet patterns
  if (/ipad|android(?!.*mobile)|tablet|kindle|silk/i.test(ua)) {
    return DeviceType.TABLET;
  }

  return DeviceType.DESKTOP;
};

/**
 * Determines device type based on screen size
 */
const getDeviceTypeByScreen = (): DeviceType => {
  const width = window.screen.width;
  const height = window.screen.height;
  const maxDimension = Math.max(width, height);
  const minDimension = Math.min(width, height);

  // Phone: typically < 768px in smallest dimension
  if (minDimension < 768) {
    return DeviceType.MOBILE;
  }

  // Tablet: 768-1024px range
  if (minDimension >= 768 && maxDimension <= 1366) {
    return DeviceType.TABLET;
  }

  return DeviceType.DESKTOP;
};

/**
 * Main device detection function
 * Combines multiple signals to accurately classify device type
 */
export const detectDevice = (): DeviceInfo => {
  // First check if this is devtools emulation
  const isEmulation = isDevToolsEmulation();

  // If emulation detected, always return desktop
  if (isEmulation) {
    return {
      type: DeviceType.DESKTOP,
      isTouchDevice: false,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1,
      userAgent: navigator.userAgent,
    };
  }

  // Get genuine touch capability
  const isTouchDevice = hasGenuineTouchCapability();

  // Get device type from multiple sources
  const uaDeviceType = parseUserAgent();
  const screenDeviceType = getDeviceTypeByScreen();

  // Decision logic: prioritize UA if it claims mobile/tablet AND has genuine touch
  let finalDeviceType = DeviceType.DESKTOP;

  if (
    isTouchDevice &&
    (uaDeviceType === DeviceType.MOBILE || uaDeviceType === DeviceType.TABLET)
  ) {
    finalDeviceType = uaDeviceType;
  } else if (!isTouchDevice) {
    // No genuine touch, likely desktop
    finalDeviceType = DeviceType.DESKTOP;
  } else {
    // Has touch but UA says desktop - use screen size as tiebreaker
    finalDeviceType = screenDeviceType;
  }

  return {
    type: finalDeviceType,
    isTouchDevice,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    userAgent: navigator.userAgent,
  };
};

/**
 * Returns device priority for role assignment
 * Lower number = higher priority to become remote
 */
export const getDevicePriority = (deviceType: DeviceType): number => {
  switch (deviceType) {
    case DeviceType.MOBILE:
      return 1; // Highest priority
    case DeviceType.TABLET:
      return 2;
    case DeviceType.DESKTOP:
      return 3; // Lowest priority
    default:
      return 999;
  }
};

/**
 * Checks if device type should prefer being a remote control
 */
export const shouldPreferRemoteRole = (deviceType: DeviceType): boolean => {
  return deviceType === DeviceType.MOBILE || deviceType === DeviceType.TABLET;
};
