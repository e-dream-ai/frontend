import type { ImagePreset, ImagePresetName } from "@/types/image.types";

export const IMAGE_PRESETS = {
  dream: { maxDimension: 4096, quality: 85 },
  thumbnail: { maxDimension: 2048, quality: 85 },
  avatar: { maxDimension: 1024, quality: 85 },
} as const satisfies Record<ImagePresetName, ImagePreset>;

export const WEBP_MIME_TYPE = "image/webp";
export const WEBP_EXTENSION = "webp";
export const IMAGE_ENCODE_TIMEOUT_MS = 30_000;
export const CLIENT_ENCODE_SKIPPED_FORMATS: ReadonlySet<string> = new Set([
  "gif",
  "svg",
  "image/gif",
  "image/svg+xml",
]);
