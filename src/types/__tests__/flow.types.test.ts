import { describe, it, expect } from "vitest";
import type { FlowTransition, TransitionStatus } from "@/types/flow.types";

describe("FlowTransition type", () => {
  it("accepts a valid idle transition", () => {
    const t: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      status: "idle",
    };
    expect(t.status).toBe("idle");
  });

  it("accepts a transition with all overrides and generation state", () => {
    const t: FlowTransition = {
      fromKeyframeId: "a",
      toKeyframeId: "b",
      presetOverride: "Camera Basics",
      promptOverride: "zoom in",
      durationOverride: 8,
      modelOverride: "wan-i2v",
      loraOverride: [{ path: "lora.safetensors", scale: 1 }],
      dreamUuid: "dream-123",
      status: "processing",
      progress: 45,
      uprezDreamUuid: "uprez-456",
      uprezStatus: "queue",
      uprezProgress: 0,
    };
    expect(t.progress).toBe(45);
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
