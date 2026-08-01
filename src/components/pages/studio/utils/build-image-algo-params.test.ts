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
});
