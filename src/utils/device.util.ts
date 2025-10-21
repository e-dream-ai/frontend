import { DeviceType } from "@/types/roles.types";

const DEVICE_ID_STORAGE_KEY = "rc.device.id";

export function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existing) return existing;
  const id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
  return id;
}

export function detectDeviceType(): DeviceType {
  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /iphone|ipod|android.*mobile/.test(ua);
  const isTablet =
    /ipad|android(?!.*mobile)/.test(ua) || (navigator.maxTouchPoints || 0) > 1;
  if (isMobile) return "phone";
  if (isTablet) return "tablet";
  return "desktop";
}

export function canPlayVideo(): boolean {
  const video = document.createElement("video");
  return typeof video.canPlayType === "function";
}
