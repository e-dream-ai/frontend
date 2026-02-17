export type StudioTab = "images" | "actions" | "generate" | "results";

export interface StudioImage {
  uuid: string;
  url: string;
  name: string;
  seed?: number;
  status: "queue" | "processing" | "processed" | "failed";
  progress?: number;
  selected: boolean;
  previewFrame?: string;
}

export interface LoRAConfig {
  path: string;
  scale: number;
}

export interface StudioAction {
  id: string;
  prompt: string;
  enabled: boolean;
  highNoiseLoras?: LoRAConfig[];
  lowNoiseLoras?: LoRAConfig[];
}

export interface StudioJob {
  imageId: string;
  actionId: string;
  dreamUuid: string;
  status: "queue" | "processing" | "processed" | "failed";
  progress?: number;
  previewFrame?: string;
  selectedForUprez: boolean;
  startedAt?: number;
  completedAt?: number;
}

export interface WanI2VParams {
  duration: number;
  numInferenceSteps: number;
  guidance: number;
}

export interface QwenParams {
  seedCount: number;
  size: string;
}

export const createComboKey = (
  imageUuid: string,
  actionPrompt: string,
): string => {
  const hash = Array.from(actionPrompt)
    .reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
    .toString(16)
    .slice(-8);
  return `${imageUuid}:${hash}`;
};
