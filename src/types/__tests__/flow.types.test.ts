import { describe, it, expect } from "vitest";
import type { FlowTransition, TransitionStatus } from "@/types/flow.types";
// Relative, not "@/": the alias does not resolve for value imports in tests.
import { DEFAULT_TRANSITION_SETTINGS } from "../../components/pages/studio/constants/default-transition-settings";

describe("FlowTransition type", () => {
  it("accepts a valid idle transition", () => {
    const t: FlowTransition = {
      fromFrameId: "a",
      toFrameId: "b",
      status: "idle",
      settings: DEFAULT_TRANSITION_SETTINGS,
    };
    expect(t.status).toBe("idle");
  });

  it("accepts a transition with full settings and generation state", () => {
    const t: FlowTransition = {
      fromFrameId: "a",
      toFrameId: "b",
      settings: {
        prompt: "zoom in",
        negativePrompt: "",
        duration: 8,
        model: "wan-i2v",
        steps: 30,
        guidance: 0.5,
        seed: -1,
        highNoiseLoras: [{ path: "lora.safetensors", scale: 1 }],
        lowNoiseLoras: [{ path: "lora-low.safetensors", scale: 1 }],
      },
      dreamUuid: "dream-123",
      status: "processing",
      progress: 45,
      uprezDreamUuid: "uprez-456",
      uprezStatus: "queue",
      uprezProgress: 0,
    };
    expect(t.progress).toBe(45);
    expect(t.settings.duration).toBe(8);
  });

  it("carries a complete settings object — every field is required", () => {
    // The shape is the guarantee: nothing is optional, so nothing resolves at
    // read time and no field can mean "inherit".
    expect(Object.keys(DEFAULT_TRANSITION_SETTINGS).sort()).toEqual([
      "duration",
      "guidance",
      "highNoiseLoras",
      "lowNoiseLoras",
      "model",
      "negativePrompt",
      "prompt",
      "seed",
      "steps",
    ]);
  });

  it("enforces TransitionStatus union", () => {
    const statuses: TransitionStatus[] = [
      "idle",
      "queue",
      "processing",
      "processed",
      "failed",
    ];
    expect(statuses).toHaveLength(5);
  });
});
