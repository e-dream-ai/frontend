import { describe, it, expect, beforeEach } from "vitest";
import { useStudioStore } from "../../../../stores/studio.store";
import { applyImageOrigin } from "./apply-image-origin";

describe("applyImageOrigin", () => {
  beforeEach(() => {
    useStudioStore.getState().resetSession();
  });

  it("restores a frame's Krea options", () => {
    applyImageOrigin({
      kind: "generated",
      prompt: "a cat",
      algorithm: "krea-2-turbo-style",
      model: "krea-2-turbo-style",
      promptExpansion: true,
      styleScale: 3,
    });
    expect(useStudioStore.getState().imageGenParams).toMatchObject({
      model: "krea-2-turbo-style",
      promptExpansion: true,
      styleScale: 3,
    });
  });

  it("clears Krea options for a frame made without them", () => {
    useStudioStore
      .getState()
      .setImageGenParams({ promptExpansion: true, styleScale: 4 });
    applyImageOrigin({
      kind: "generated",
      prompt: "a cat",
      algorithm: "krea-2-turbo-style",
      model: "krea-2-turbo-style",
    });
    const { promptExpansion, styleScale } =
      useStudioStore.getState().imageGenParams;
    expect(promptExpansion).toBeUndefined();
    expect(styleScale).toBeUndefined();
  });

  it("restores a Krea Large frame's creativity and clears it otherwise", () => {
    applyImageOrigin({
      kind: "generated",
      prompt: "a cat",
      algorithm: "krea-2-large",
      model: "krea-2-large",
      creativity: "low",
    });
    expect(useStudioStore.getState().imageGenParams).toMatchObject({
      model: "krea-2-large",
      creativity: "low",
    });
    applyImageOrigin({
      kind: "generated",
      prompt: "a cat",
      algorithm: "krea-2-large",
      model: "krea-2-large",
    });
    expect(useStudioStore.getState().imageGenParams.creativity).toBeUndefined();
  });
});
