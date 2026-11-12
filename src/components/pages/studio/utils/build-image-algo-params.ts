import type { ImageModel } from "@/types/studio.types";

interface BuildImageAlgoParamsInput {
  model: ImageModel;
  prompt: string;
  size: string;
  seed: number;
  negativePrompt?: string;
  sourceDreamUuid?: string;
  promptExpansion?: boolean;
  styleScale?: number;
  creativity?: string;
}

/** The Krea 2 Turbo models, which take prompt expansion. */
export const isKreaModel = (model: ImageModel) =>
  model === "krea-2-turbo" || model === "krea-2-turbo-style";

/**
 * Build the `algoParams` payload for a still-image generation dream. Shared by
 * the batch Images tab and the flow "Generate Reference Frames" modal so both send an
 * identical shape. Krea Style requires a reference; text-only models never send it.
 * Krea Turbo models take prompt expansion (sent only when on) and, for Style, a style
 * scale. Krea Large takes creativity and, like the Turbo models, no negative prompt.
 */
export const buildImageAlgoParams = ({
  model,
  prompt,
  size,
  seed,
  negativePrompt,
  sourceDreamUuid,
  promptExpansion,
  styleScale,
  creativity,
}: BuildImageAlgoParamsInput): Record<string, unknown> => {
  const params: Record<string, unknown> = {
    infinidream_algorithm: model,
    prompt,
    size,
    seed,
  };
  if (model === "krea-2-turbo-style") {
    const reference = sourceDreamUuid?.trim();
    if (!reference)
      throw new Error("Choose a style reference image before generating.");
    params.source_dream_uuid = reference;
    if (styleScale !== undefined) params.style_scale = styleScale;
  }
  if (isKreaModel(model)) {
    if (promptExpansion) params.enable_prompt_expansion = true;
    return params;
  }
  if (model === "krea-2-large") {
    if (creativity) params.creativity = creativity;
    return params;
  }
  const trimmedNegative = negativePrompt?.trim();
  if (trimmedNegative) {
    params.negative_prompt = trimmedNegative;
  }
  return params;
};
