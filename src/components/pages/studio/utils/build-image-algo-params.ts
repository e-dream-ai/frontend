import type { ImageModel } from "@/types/studio.types";

interface BuildImageAlgoParamsInput {
  model: ImageModel;
  prompt: string;
  size: string;
  seed: number;
  negativePrompt?: string;
}

/**
 * Build the `algoParams` payload for a still-image generation dream. Shared by
 * the batch Images tab and the flow "Generate Reference Frames" modal so both send an
 * identical shape. `negative_prompt` is included only when a non-empty value is
 * given (same convention as buildVideoAlgoParams).
 */
export const buildImageAlgoParams = ({
  model,
  prompt,
  size,
  seed,
  negativePrompt,
}: BuildImageAlgoParamsInput): Record<string, unknown> => {
  const params: Record<string, unknown> = {
    infinidream_algorithm: model,
    prompt,
    size,
    seed,
  };
  const trimmedNegative = negativePrompt?.trim();
  if (trimmedNegative) {
    params.negative_prompt = trimmedNegative;
  }
  return params;
};
