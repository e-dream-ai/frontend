import { describe, it, expect } from "vitest";
import { resolveNegativePromptSupport } from "./negative-prompt-support";
import type { ModelCatalogEntry } from "@/types/model.types";

const model = (
  id: string,
  label: string,
  supportsNegativePrompt?: boolean,
): ModelCatalogEntry => ({
  id,
  label,
  provider: "fal",
  mediaType: "image",
  constraints: { supportsNegativePrompt },
});

const CATALOG = [
  model("qwen-image", "Qwen Image", true),
  model("flux-schnell", "FLUX.1 [schnell]", false),
  model("z-image-turbo", "Z Image Turbo", false),
];

describe("resolveNegativePromptSupport", () => {
  it("enables the field for a model that supports it", () => {
    expect(resolveNegativePromptSupport(CATALOG, "qwen-image")).toEqual({
      enabled: true,
      hint: null,
    });
  });

  it("disables it and names the alternative when unsupported", () => {
    expect(resolveNegativePromptSupport(CATALOG, "flux-schnell")).toEqual({
      enabled: false,
      hint: "FLUX.1 [schnell] ignores negative prompts. Switch to Qwen Image to use one.",
    });
  });

  it("lists every supported alternative", () => {
    const catalog = [...CATALOG, model("other", "Other Model", true)];
    expect(resolveNegativePromptSupport(catalog, "z-image-turbo").hint).toBe(
      "Z Image Turbo ignores negative prompts. Switch to Qwen Image or Other Model to use one.",
    );
  });

  it("omits the suggestion when nothing else supports it", () => {
    const catalog = [model("flux-schnell", "FLUX.1 [schnell]", false)];
    expect(resolveNegativePromptSupport(catalog, "flux-schnell").hint).toBe(
      "FLUX.1 [schnell] ignores negative prompts.",
    );
  });

  it("stays permissive for an unknown model", () => {
    // Persisted model ids outlive catalog entries; never claim a model we do
    // not recognise ignores the field.
    expect(resolveNegativePromptSupport(CATALOG, "removed-model")).toEqual({
      enabled: true,
      hint: null,
    });
  });

  it("stays permissive before the catalog has loaded", () => {
    expect(resolveNegativePromptSupport([], "flux-schnell")).toEqual({
      enabled: true,
      hint: null,
    });
  });

  it("stays permissive for a model that declares no opinion", () => {
    const catalog = [model("new-model", "New Model")];
    expect(resolveNegativePromptSupport(catalog, "new-model")).toEqual({
      enabled: true,
      hint: null,
    });
  });
});
