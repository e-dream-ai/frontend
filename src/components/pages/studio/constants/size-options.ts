import type { ImageModel } from "@/types/studio.types";

const QWEN_SIZES = ["1280*720", "1024*1024", "720*1280", "512*512"] as const;

const ZIT_SIZES = [
  "1280*720",
  "1024*1024",
  "720*1280",
  "512*512",
  "768*768",
  "1280*1280",
  "1024*768",
  "768*1024",
] as const;

export const SIZE_OPTIONS: Record<ImageModel, readonly string[]> = {
  "qwen-image": QWEN_SIZES,
  "z-image-turbo": ZIT_SIZES,
};

export const IMAGE_COUNT_OPTIONS = [1, 4, 8, 12, 16, 24] as const;

export const clampSizeToModel = (
  currentSize: string,
  model: ImageModel,
): string => {
  const sizes = SIZE_OPTIONS[model];
  return sizes.includes(currentSize) ? currentSize : sizes[0];
};
