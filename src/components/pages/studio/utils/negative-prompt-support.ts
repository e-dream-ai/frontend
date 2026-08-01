import type { ModelCatalogEntry } from "@/types/model.types";

type NegativePromptSupport =
  | { enabled: true; hint: null }
  | { enabled: false; hint: string };

export const resolveNegativePromptSupport = (
  models: ModelCatalogEntry[],
  modelId: string,
): NegativePromptSupport => {
  const current = models.find((m) => m.id === modelId);
  if (current?.constraints?.supportsNegativePrompt !== false) {
    return { enabled: true, hint: null };
  }

  const alternatives = models.flatMap((m) =>
    m.constraints?.supportsNegativePrompt === true ? [m.label] : [],
  );
  const base = `${current.label} ignores negative prompts.`;
  return {
    enabled: false,
    hint: alternatives.length
      ? `${base} Switch to ${alternatives.join(" or ")} to use one.`
      : base,
  };
};
