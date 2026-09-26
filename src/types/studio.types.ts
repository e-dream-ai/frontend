export type StudioTab = "images" | "actions" | "generate" | "results";

export interface StudioImage {
  uuid: string;
  url: string;
  name: string;
  seed?: number;
  size?: string;
  status: "queue" | "processing" | "processed" | "failed";
  progress?: number;
  previewFrame?: string;
}

export type StyleReference = Pick<StudioImage, "uuid" | "name">;

export interface LoRAConfig {
  path: string;
  scale: number;
}

export interface StudioAction {
  id: string;
  prompt: string;
  // Prompt-level negative, supplied by presets that need one (transitions).
  // Undefined means "no opinion" — the user's negative prompt stands.
  negativePrompt?: string;
  highNoiseLoras?: LoRAConfig[];
  lowNoiseLoras?: LoRAConfig[];
}

export type VideoModel = "wan-i2v" | "ltx-i2v" | "kling-i2v" | "kling-25-i2v";

export type UprezModel = "uprez";

export type StudioJobType =
  | "wan-i2v"
  | "ltx-i2v"
  | "kling-i2v"
  | "kling-25-i2v"
  | "uprez";

export interface StudioJob {
  imageId: string;
  actionId: string;
  dreamUuid: string;
  jobType: StudioJobType;
  status: "queue" | "processing" | "processed" | "failed";
  progress?: number;
  previewFrame?: string;
  thumbnailUrl?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface VideoGenParams {
  model: VideoModel;
  duration: number;
  numInferenceSteps: number;
  guidance: number;
  seed: number;
}

export const STUDIO_IMAGE_MODELS = [
  "qwen-image",
  "z-image-turbo",
  "flux-schnell",
  "krea-2-turbo",
  "krea-2-turbo-style",
] as const;

export type ImageModel = (typeof STUDIO_IMAGE_MODELS)[number];

export const isStudioImageModel = (model: string): model is ImageModel =>
  STUDIO_IMAGE_MODELS.some((supported) => supported === model);

export interface ImageGenParams {
  model: ImageModel;
  seedCount: number;
  size: string;
  negativePrompt: string;
}

export const createComboKey = (
  imageUuid: string,
  actionPrompt: string,
): string => {
  const hash = Math.abs(
    Array.from(actionPrompt).reduce(
      (h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0,
      0,
    ),
  )
    .toString(16)
    .padStart(8, "0")
    .slice(-8);
  return `${imageUuid}:${hash}`;
};
