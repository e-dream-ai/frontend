import { describe, it, expect } from "vitest";
import { buildImageAlgoParams } from "./build-image-algo-params";

describe("buildImageAlgoParams", () => {
  const base = {
    model: "qwen-image" as const,
    prompt: "a crystal cave",
    size: "1280*720",
    seed: 42,
  };

  it("builds the core image params", () => {
    expect(buildImageAlgoParams(base)).toEqual({
      infinidream_algorithm: "qwen-image",
      prompt: "a crystal cave",
      size: "1280*720",
      seed: 42,
    });
  });

  it("omits negative_prompt when not provided", () => {
    expect(buildImageAlgoParams(base)).not.toHaveProperty("negative_prompt");
  });

  it("omits negative_prompt when empty or whitespace-only", () => {
    expect(
      buildImageAlgoParams({ ...base, negativePrompt: "   " }),
    ).not.toHaveProperty("negative_prompt");
    expect(
      buildImageAlgoParams({ ...base, negativePrompt: "" }),
    ).not.toHaveProperty("negative_prompt");
  });

  it("includes trimmed negative_prompt when provided", () => {
    expect(
      buildImageAlgoParams({ ...base, negativePrompt: "  blurry, text  " }),
    ).toEqual({
      infinidream_algorithm: "qwen-image",
      prompt: "a crystal cave",
      size: "1280*720",
      seed: 42,
      negative_prompt: "blurry, text",
    });
  });

  it("builds Krea Turbo params without a stale reference or negative prompt", () => {
    expect(
      buildImageAlgoParams({
        ...base,
        model: "krea-2-turbo",
        sourceDreamUuid: "old-reference",
        negativePrompt: "blur",
      }),
    ).toEqual({
      infinidream_algorithm: "krea-2-turbo",
      prompt: "a crystal cave",
      size: "1280*720",
      seed: 42,
    });
  });

  it("sends a style reference with the requested Krea output size", () => {
    expect(
      buildImageAlgoParams({
        ...base,
        model: "krea-2-turbo-style",
        sourceDreamUuid: "reference-uuid",
        negativePrompt: "blur",
      }),
    ).toEqual({
      infinidream_algorithm: "krea-2-turbo-style",
      prompt: "a crystal cave",
      size: "1280*720",
      seed: 42,
      source_dream_uuid: "reference-uuid",
    });
  });

  it("sends prompt expansion for Krea only when it is on", () => {
    const krea = { ...base, model: "krea-2-turbo" as const };
    expect(
      buildImageAlgoParams({ ...krea, promptExpansion: true }),
    ).toHaveProperty("enable_prompt_expansion", true);
    expect(
      buildImageAlgoParams({ ...krea, promptExpansion: false }),
    ).not.toHaveProperty("enable_prompt_expansion");
    expect(
      buildImageAlgoParams({ ...base, promptExpansion: true }),
    ).not.toHaveProperty("enable_prompt_expansion");
  });

  it("sends style scale for Krea Style only", () => {
    expect(
      buildImageAlgoParams({
        ...base,
        model: "krea-2-turbo-style",
        sourceDreamUuid: "reference-uuid",
        styleScale: 2.5,
        promptExpansion: true,
      }),
    ).toEqual({
      infinidream_algorithm: "krea-2-turbo-style",
      prompt: "a crystal cave",
      size: "1280*720",
      seed: 42,
      source_dream_uuid: "reference-uuid",
      style_scale: 2.5,
      enable_prompt_expansion: true,
    });
    expect(
      buildImageAlgoParams({ ...base, model: "krea-2-turbo", styleScale: 2 }),
    ).not.toHaveProperty("style_scale");
  });

  it("sends creativity for Krea Large only, without a negative prompt", () => {
    expect(
      buildImageAlgoParams({
        ...base,
        model: "krea-2-large",
        creativity: "high",
        negativePrompt: "blur",
        promptExpansion: true,
        styleScale: 2,
        sourceDreamUuid: "old-reference",
      }),
    ).toEqual({
      infinidream_algorithm: "krea-2-large",
      prompt: "a crystal cave",
      size: "1280*720",
      seed: 42,
      creativity: "high",
    });
    expect(
      buildImageAlgoParams({ ...base, model: "krea-2-large" }),
    ).not.toHaveProperty("creativity");
    expect(
      buildImageAlgoParams({
        ...base,
        model: "krea-2-turbo",
        creativity: "high",
      }),
    ).not.toHaveProperty("creativity");
  });

  it.each([undefined, "", "   "])(
    "rejects Krea Style without a reference (%s)",
    (sourceDreamUuid) => {
      expect(() =>
        buildImageAlgoParams({
          ...base,
          model: "krea-2-turbo-style",
          sourceDreamUuid,
        }),
      ).toThrow(/reference/i);
    },
  );
});
