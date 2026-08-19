import type { StudioAction, VideoModel } from "@/types/studio.types";
import { hasActionLoras } from "../constants/duration-options";
import { GUIDANCE_PARAM } from "../constants/guidance-options";

interface BuildVideoAlgoParamsInput {
  model: VideoModel;
  action: Pick<StudioAction, "prompt" | "highNoiseLoras" | "lowNoiseLoras">;
  imageUuid: string;
  endImageUuid?: string;
  imageSize: string | undefined;
  duration: number;
  numInferenceSteps: number;
  guidance: number;
  seed?: number;
  negativePrompt?: string;
}

const setGuidance = (
  params: Record<string, unknown>,
  model: VideoModel,
  guidance: number,
): void => {
  const param = GUIDANCE_PARAM[model];
  if (!param || !Number.isFinite(guidance)) return;
  params[param] = guidance;
};

export const buildVideoAlgoParams = ({
  model,
  action,
  imageUuid,
  endImageUuid,
  imageSize,
  duration,
  numInferenceSteps,
  guidance,
  seed,
  negativePrompt,
}: BuildVideoAlgoParamsInput): Record<string, unknown> => {
  const hasLoras = hasActionLoras(action);
  const trimmedNegative = negativePrompt?.trim();

  if (model === "kling-i2v" || model === "kling-25-i2v") {
    const params: Record<string, unknown> = {
      infinidream_algorithm: model,
      prompt: action.prompt,
      source_dream_uuid: imageUuid,
      duration,
    };
    if (trimmedNegative) {
      params.negative_prompt = trimmedNegative;
    }
    if (endImageUuid) {
      params.end_source_uuid = endImageUuid;
    }
    setGuidance(params, model, guidance);
    return params;
  }

  if (model === "ltx-i2v") {
    // Worker fixes the step schedule internally (8+3 steps, LCM). Guidance is
    // ours to set — the worker defaults it to 1.0 when absent.
    // Only high_noise_loras[0] is used (single LoRA via Power Lora Loader).
    const params: Record<string, unknown> = {
      infinidream_algorithm: "ltx-i2v",
      prompt: action.prompt,
      source_dream_uuid: imageUuid,
      duration,
    };
    if (trimmedNegative) {
      params.negative_prompt = trimmedNegative;
    }
    if (endImageUuid) {
      params.end_source_uuid = endImageUuid;
    }
    if (hasLoras && action.highNoiseLoras?.length) {
      params.high_noise_loras = action.highNoiseLoras;
    }
    if (Number.isFinite(seed)) {
      params.seed = seed;
    }
    setGuidance(params, model, guidance);
    return params;
  }

  if (hasLoras) {
    const params: Record<string, unknown> = {
      infinidream_algorithm: "wan-i2v-lora",
      prompt: action.prompt,
      image: imageUuid,
      duration,
      num_inference_steps: numInferenceSteps,
      seed: -1,
      high_noise_loras: action.highNoiseLoras ?? [],
      low_noise_loras: action.lowNoiseLoras ?? [],
    };
    if (trimmedNegative) {
      params.negative_prompt = trimmedNegative;
    }
    setGuidance(params, model, guidance);
    return params;
  }

  const params: Record<string, unknown> = {
    infinidream_algorithm: "wan-i2v",
    prompt: action.prompt,
    image: imageUuid,
    size: imageSize || "1280*720",
    duration,
    num_inference_steps: numInferenceSteps,
  };
  if (trimmedNegative) {
    params.negative_prompt = trimmedNegative;
  }
  setGuidance(params, model, guidance);
  return params;
};
