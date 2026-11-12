import { describe, expect, it } from "vitest";
import { imageOriginFromDreamPrompt } from "./image-prompt";

describe("imageOriginFromDreamPrompt", () => {
  it("reads a studio-generated frame's params", () => {
    const origin = imageOriginFromDreamPrompt(
      JSON.stringify({
        infinidream_algorithm: "qwen-image",
        prompt: "a lighthouse",
        size: "1280*720",
        seed: 42,
        negative_prompt: "blur",
      }),
    );
    expect(origin).toEqual({
      kind: "generated",
      prompt: "a lighthouse",
      algorithm: "qwen-image",
      model: "qwen-image",
      negativePrompt: "blur",
      size: "1280*720",
      seed: 42,
      styleReferenceUuid: undefined,
    });
  });

  it("keeps the style reference of a Krea Style frame", () => {
    const origin = imageOriginFromDreamPrompt({
      infinidream_algorithm: "krea-2-turbo-style",
      prompt: "a cat",
      source_dream_uuid: "ref-uuid",
    });
    expect(origin.kind === "generated" && origin.styleReferenceUuid).toBe(
      "ref-uuid",
    );
  });

  it("reads Krea prompt expansion and style scale back", () => {
    const origin = imageOriginFromDreamPrompt({
      infinidream_algorithm: "krea-2-turbo-style",
      prompt: "a cat",
      source_dream_uuid: "ref-uuid",
      enable_prompt_expansion: true,
      style_scale: 2.5,
    });
    expect(origin).toMatchObject({
      promptExpansion: true,
      styleScale: 2.5,
    });
  });

  it("reads Krea Large creativity back", () => {
    const origin = imageOriginFromDreamPrompt({
      infinidream_algorithm: "krea-2-large",
      prompt: "a cat",
      creativity: "raw",
    });
    expect(origin).toMatchObject({ model: "krea-2-large", creativity: "raw" });
  });

  it("leaves Krea options unset for older frames", () => {
    const origin = imageOriginFromDreamPrompt({
      infinidream_algorithm: "krea-2-turbo",
      prompt: "a cat",
      style_scale: "2",
    });
    expect(origin).toMatchObject({
      promptExpansion: undefined,
      styleScale: undefined,
    });
  });

  it("gives no model for an algorithm the studio does not generate with", () => {
    const origin = imageOriginFromDreamPrompt({
      infinidream_algorithm: "something-else",
      prompt: "a tree",
    });
    expect(origin.kind).toBe("generated");
    expect(origin.kind === "generated" && origin.model).toBeUndefined();
  });

  it("calls a frame with no prompt uploaded", () => {
    expect(imageOriginFromDreamPrompt(null)).toEqual({ kind: "uploaded" });
    expect(imageOriginFromDreamPrompt(undefined)).toEqual({ kind: "uploaded" });
    expect(imageOriginFromDreamPrompt("")).toEqual({ kind: "uploaded" });
    expect(imageOriginFromDreamPrompt("{}")).toEqual({ kind: "uploaded" });
  });

  it("takes a bare string as the prompt", () => {
    expect(imageOriginFromDreamPrompt("a river")).toEqual({
      kind: "generated",
      prompt: "a river",
      algorithm: "",
    });
  });
});
