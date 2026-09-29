import type { VideoModel } from "@/types/studio.types";

/** How each video model is named in the studio. */
export const VIDEO_MODEL_LABELS: Record<VideoModel, string> = {
  "ltx-i2v": "LTX 2.3",
  "wan-i2v": "Wan I2V",
  "kling-i2v": "Kling 3.0 Pro",
  "kling-25-i2v": "Kling 2.5 Turbo Pro",
};
