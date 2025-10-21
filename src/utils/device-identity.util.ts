/**
 * Device identity utility
 * Manages persistent device IDs across sessions
 */

import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "edreams_device_id";
const DEVICE_NAME_KEY = "edreams_device_name";

/**
 * Generates a unique device fingerprint based on available characteristics
 */
const generateDeviceFingerprint = (): string => {
  const components: string[] = [];

  // Screen resolution
  components.push(`${window.screen.width}x${window.screen.height}`);

  // Pixel ratio
  components.push(`dpr${window.devicePixelRatio || 1}`);

  // Color depth
  components.push(`cd${window.screen.colorDepth}`);

  // Timezone
  components.push(`tz${new Date().getTimezoneOffset()}`);

  // Platform
  components.push(navigator.platform);

  // Hardware concurrency (CPU cores)
  if ("hardwareConcurrency" in navigator) {
    components.push(`cpu${navigator.hardwareConcurrency}`);
  }

  // Max touch points
  if ("maxTouchPoints" in navigator) {
    components.push(`touch${navigator.maxTouchPoints}`);
  }

  return components.join("|");
};

/**
 * Gets or creates a persistent device ID
 * Uses localStorage to maintain identity across sessions
 */
export const getDeviceId = (): string => {
  try {
    // Try to get existing device ID
    const existingId = localStorage.getItem(DEVICE_ID_KEY);

    if (existingId) {
      return existingId;
    }

    // Generate new device ID
    const newId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, newId);

    return newId;
  } catch (error) {
    // Fallback if localStorage is not available
    // Use fingerprint-based ID (less reliable but better than nothing)
    return `fp-${generateDeviceFingerprint()}`;
  }
};

/**
 * Gets a human-readable device name
 * Falls back to generating one based on device characteristics
 */
export const getDeviceName = (): string => {
  try {
    const existingName = localStorage.getItem(DEVICE_NAME_KEY);

    if (existingName) {
      return existingName;
    }

    // Generate default name based on device type and user agent
    const ua = navigator.userAgent;
    let deviceName = "Unknown Device";

    if (/iPhone/i.test(ua)) {
      deviceName = "iPhone";
    } else if (/iPad/i.test(ua)) {
      deviceName = "iPad";
    } else if (/Android/i.test(ua) && /Mobile/i.test(ua)) {
      deviceName = "Android Phone";
    } else if (/Android/i.test(ua)) {
      deviceName = "Android Tablet";
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      deviceName = "Mac";
    } else if (/Windows/i.test(ua)) {
      deviceName = "Windows PC";
    } else if (/Linux/i.test(ua)) {
      deviceName = "Linux PC";
    }

    // Store generated name
    localStorage.setItem(DEVICE_NAME_KEY, deviceName);

    return deviceName;
  } catch (error) {
    return "Unknown Device";
  }
};

/**
 * Sets a custom device name
 */
export const setDeviceName = (name: string): void => {
  try {
    localStorage.setItem(DEVICE_NAME_KEY, name);
  } catch (error) {
    console.error("Failed to set device name:", error);
  }
};

/**
 * Clears device identity (useful for testing)
 */
export const clearDeviceIdentity = (): void => {
  try {
    localStorage.removeItem(DEVICE_ID_KEY);
    localStorage.removeItem(DEVICE_NAME_KEY);
  } catch (error) {
    console.error("Failed to clear device identity:", error);
  }
};
