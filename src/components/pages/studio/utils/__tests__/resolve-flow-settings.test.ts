import { describe, it, expect } from "vitest";
import {
  resolvePresetAction,
  resolveEffectiveSettings,
} from "../resolve-flow-settings";
import type { FlowTransition } from "@/types/flow.types";

describe("resolvePresetAction", () => {
  it("returns first action from a known preset pack", () => {
    const action = resolvePresetAction("Camera Basics");
    expect(action).toBeDefined();
    expect(action!.prompt).toBeTruthy();
    expect(action!.highNoiseLoras).toBeDefined();
  });

  it("resolves a transition preset pack by name", () => {
    const action = resolvePresetAction("Whip Pan");
    expect(action).toBeDefined();
    expect(action!.prompt).toContain("whip pan");
    expect(action!.negativePrompt).toBeUndefined();
  });

  it("carries the negative prompt of a transition preset that defines one", () => {
    const action = resolvePresetAction("Morph");
    expect(action!.negativePrompt).toContain("hard cut");
  });

  it("returns undefined for unknown preset name", () => {
    expect(resolvePresetAction("Nonexistent Pack")).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(resolvePresetAction("")).toBeUndefined();
  });
});

describe("resolveEffectiveSettings", () => {
  const globalSettings = {
    globalPresetId: "Camera Basics",
    globalPrompt: "global prompt",
    globalNegativePrompt: "global negative",
    globalDuration: 5,
    globalModel: "wan-i2v" as const,
    globalNumInferenceSteps: 30,
    globalGuidance: 5.0,
    globalSeed: -1,
    globalLora: undefined,
  };

  it("uses global settings when transition has no overrides", () => {
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
    };
    const settings = resolveEffectiveSettings(transition, globalSettings);
    expect(settings.presetId).toBe("Camera Basics");
    expect(settings.prompt).toBe("global prompt");
    expect(settings.negativePrompt).toBe("global negative");
    expect(settings.duration).toBe(5);
    expect(settings.model).toBe("wan-i2v");
    expect(settings.numInferenceSteps).toBe(30);
    expect(settings.guidance).toBe(5.0);
    expect(settings.seed).toBe(-1);
  });

  it("overrides with per-transition values", () => {
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
      presetOverride: "Organic",
      promptOverride: "override prompt",
      negativePromptOverride: "override negative",
      durationOverride: 10,
      modelOverride: "ltx-i2v",
      seedOverride: 42,
    };
    const settings = resolveEffectiveSettings(transition, globalSettings);
    expect(settings.presetId).toBe("Organic");
    expect(settings.prompt).toBe("override prompt");
    expect(settings.negativePrompt).toBe("override negative");
    expect(settings.duration).toBe(10);
    expect(settings.model).toBe("ltx-i2v");
    expect(settings.numInferenceSteps).toBe(30);
    expect(settings.guidance).toBe(5.0);
    expect(settings.seed).toBe(42);
  });

  it("builds a bare action when no preset is selected", () => {
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
    };
    const settings = resolveEffectiveSettings(transition, {
      ...globalSettings,
      globalPresetId: "",
    });
    expect(settings.action.prompt).toBe("global prompt");
    expect(settings.action.highNoiseLoras).toEqual([]);
    expect(settings.action.lowNoiseLoras).toEqual([]);
  });

  it("resolves action from preset pack using first action", () => {
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
    };
    const settings = resolveEffectiveSettings(transition, globalSettings);
    expect(settings.action).toBeDefined();
    expect(settings.action.prompt).toBeTruthy();
  });

  it("falls back to the preset negative prompt when none is stored", () => {
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
      presetOverride: "Morph",
    };
    const settings = resolveEffectiveSettings(transition, {
      ...globalSettings,
      globalNegativePrompt: "",
    });
    expect(settings.negativePrompt).toContain("hard cut");
  });

  it("a stored negative prompt wins over the preset's", () => {
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
      presetOverride: "Morph",
      negativePromptOverride: "my negative",
    };
    const settings = resolveEffectiveSettings(transition, globalSettings);
    expect(settings.negativePrompt).toBe("my negative");
  });

  it("leaves the negative prompt empty for a preset without one", () => {
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
      presetOverride: "Whip Pan",
    };
    const settings = resolveEffectiveSettings(transition, {
      ...globalSettings,
      globalNegativePrompt: "",
    });
    expect(settings.negativePrompt).toBe("");
  });

  it("resolves a transition preset's prompt into the action", () => {
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
      presetOverride: "Dolly Zoom",
    };
    const settings = resolveEffectiveSettings(transition, {
      ...globalSettings,
      globalPrompt: "",
    });
    expect(settings.action.prompt).toContain("dollies forward");
    expect(settings.action.highNoiseLoras).toEqual([]);
  });

  it("applies prompt override on top of preset action", () => {
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
      promptOverride: "my custom prompt",
    };
    const settings = resolveEffectiveSettings(transition, globalSettings);
    expect(settings.action.prompt).toBe("my custom prompt");
  });

  it("globalLora overrides preset LoRAs", () => {
    const customLora = [{ path: "custom-lora.safetensors", scale: 0.8 }];
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
    };
    const settings = resolveEffectiveSettings(transition, {
      ...globalSettings,
      globalLora: customLora,
    });
    expect(settings.action.highNoiseLoras).toEqual(customLora);
  });

  it("transition loraOverride overrides globalLora", () => {
    const globalLoraConfig = [{ path: "global-lora.safetensors", scale: 0.5 }];
    const transitionLoraConfig = [
      { path: "transition-lora.safetensors", scale: 1.0 },
    ];
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
      loraOverride: transitionLoraConfig,
    };
    const settings = resolveEffectiveSettings(transition, {
      ...globalSettings,
      globalLora: globalLoraConfig,
    });
    expect(settings.action.highNoiseLoras).toEqual(transitionLoraConfig);
  });

  it("falls through to preset LoRAs when globalLora is undefined", () => {
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
    };
    const settings = resolveEffectiveSettings(transition, {
      ...globalSettings,
      globalLora: undefined,
    });
    // Camera Basics preset's first action has LoRAs (zoom in)
    expect(settings.action.highNoiseLoras!.length).toBeGreaterThan(0);
    expect(settings.action.highNoiseLoras![0].path).toContain("zoom_in");
  });

  it("an explicit empty globalLora strips the preset's LoRA (None)", () => {
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
    };
    const settings = resolveEffectiveSettings(transition, {
      ...globalSettings,
      globalLora: [],
    });
    expect(settings.action.highNoiseLoras).toEqual([]);
    expect(settings.action.lowNoiseLoras).toEqual([]);
  });
});
