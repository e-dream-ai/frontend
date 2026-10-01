import { isStudioImageModel, type ImageModel } from "@/types/studio.types";

/** How a reference frame was made, as far as its dream records it. */
export type ImageOrigin =
  | {
      kind: "generated";
      prompt: string;
      /** Set only when it is one the studio can generate with again. */
      model?: ImageModel;
      algorithm: string;
      negativePrompt?: string;
      size?: string;
      seed?: number;
      styleReferenceUuid?: string;
    }
  /** No prompt at all: an uploaded file. */
  | { kind: "uploaded" };

export type GeneratedImageOrigin = Extract<ImageOrigin, { kind: "generated" }>;

export const imageSettings = (
  origin: GeneratedImageOrigin,
  modelLabel: string,
) =>
  [
    modelLabel,
    origin.size?.replace("*", "×"),
    origin.seed !== undefined ? `seed ${origin.seed}` : undefined,
  ].filter((setting): setting is string => Boolean(setting));

const asString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

/**
 * Reads a frame's origin back out of its dream's `prompt`, which for a
 * generated one is the algorithm params it was submitted with.
 */
export const imageOriginFromDreamPrompt = (prompt: unknown): ImageOrigin => {
  let params: unknown = prompt;
  if (typeof prompt === "string") {
    try {
      params = JSON.parse(prompt);
    } catch {
      // A bare string is a prompt with no params around it.
      return prompt.trim()
        ? { kind: "generated", prompt, algorithm: "" }
        : { kind: "uploaded" };
    }
  }
  if (!params || typeof params !== "object") return { kind: "uploaded" };
  const p = params as Record<string, unknown>;
  const text = asString(p.prompt);
  if (!text) return { kind: "uploaded" };

  const algorithm = String(p.infinidream_algorithm ?? "");
  return {
    kind: "generated",
    prompt: text,
    algorithm,
    model: isStudioImageModel(algorithm) ? algorithm : undefined,
    negativePrompt: asString(p.negative_prompt),
    size: asString(p.size),
    seed:
      typeof p.seed === "number" && Number.isFinite(p.seed)
        ? p.seed
        : undefined,
    styleReferenceUuid: asString(p.source_dream_uuid),
  };
};
