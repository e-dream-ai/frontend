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
    globalDuration: 5,
    globalModel: "wan-i2v" as const,
    globalNumInferenceSteps: 30,
    globalGuidance: 5.0,
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
    expect(settings.duration).toBe(5);
    expect(settings.model).toBe("wan-i2v");
    expect(settings.numInferenceSteps).toBe(30);
    expect(settings.guidance).toBe(5.0);
  });

  it("overrides with per-transition values", () => {
    const transition: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
      presetOverride: "Organic",
      promptOverride: "override prompt",
      durationOverride: 10,
      modelOverride: "ltx-i2v",
    };
    const settings = resolveEffectiveSettings(transition, globalSettings);
    expect(settings.presetId).toBe("Organic");
    expect(settings.prompt).toBe("override prompt");
    expect(settings.duration).toBe(10);
    expect(settings.model).toBe("ltx-i2v");
    expect(settings.numInferenceSteps).toBe(30);
    expect(settings.guidance).toBe(5.0);
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
});
