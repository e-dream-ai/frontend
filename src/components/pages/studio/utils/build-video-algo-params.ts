import type { StudioAction, VideoModel } from "@/types/studio.types";
import { hasActionLoras } from "../constants/duration-options";

interface BuildVideoAlgoParamsInput {
  model: VideoModel;
  action: Pick<StudioAction, "prompt" | "highNoiseLoras" | "lowNoiseLoras">;
  imageUuid: string;
  imageSize: string | undefined;
  duration: number;
  numInferenceSteps: number;
  guidance: number;
}

export const buildVideoAlgoParams = ({
  model,
  action,
  imageUuid,
  imageSize,
  duration,
  numInferenceSteps,
  guidance,
}: BuildVideoAlgoParamsInput): Record<string, unknown> => {
  const hasLoras = hasActionLoras(action);

  if (model === "ltx-i2v") {
    // Worker handles steps/guidance internally (8+3 steps, cfg 1.0).
    // Only high_noise_loras[0] is used (single LoRA via Power Lora Loader).
    const params: Record<string, unknown> = {
      infinidream_algorithm: "ltx-i2v",
      prompt: action.prompt,
      source_dream_uuid: imageUuid,
      duration,
    };
    if (hasLoras && action.highNoiseLoras?.length) {
      params.high_noise_loras = action.highNoiseLoras;
    }
    return params;
  }

  if (hasLoras) {
    return {
      infinidream_algorithm: "wan-i2v-lora",
      prompt: action.prompt,
      image: imageUuid,
      duration,
      num_inference_steps: numInferenceSteps,
      guidance,
      seed: -1,
      high_noise_loras: action.highNoiseLoras ?? [],
      low_noise_loras: action.lowNoiseLoras ?? [],
    };
  }

  return {
    infinidream_algorithm: "wan-i2v",
    prompt: action.prompt,
    image: imageUuid,
    size: imageSize || "1280*720",
    duration,
    num_inference_steps: numInferenceSteps,
    guidance,
  };
};
