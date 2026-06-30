import { describe, it, expect } from "vitest";
import type {
  FlowTransition,
  TransitionStatus,
  VariationCandidate,
  FlowKeyframe,
} from "@/types/flow.types";

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

describe("VariationCandidate type", () => {
  it("accepts a seed variation", () => {
    const v: VariationCandidate = {
      id: "v1",
      method: "seed",
      seed: 42,
      dreamUuid: "dream-123",
      imageUrl: "https://example.com/img.jpg",
      status: "processed",
    };
    expect(v.method).toBe("seed");
  });

  it("accepts an expansion variation", () => {
    const v: VariationCandidate = {
      id: "v2",
      method: "expansion",
      prompt: "fire elemental",
      status: "queue",
    };
    expect(v.prompt).toBe("fire elemental");
  });

  it("accepts i2i variation", () => {
    const v: VariationCandidate = {
      id: "v3",
      method: "i2i",
      status: "processing",
      progress: 45,
    };
    expect(v.method).toBe("i2i");
  });

  it("FlowKeyframe accepts variations array", () => {
    const kf: FlowKeyframe = {
      id: "kf-1",
      dreamUuid: "dream-settled",
      imageUrl: "https://example.com/img.jpg",
      name: "test",
      variations: [
        {
          id: "v1",
          method: "seed",
          seed: 1,
          status: "processed",
          imageUrl: "url1",
        },
        { id: "v2", method: "seed", seed: 2, status: "queue" },
      ],
      activeVariationId: "v1",
    };
    expect(kf.variations).toHaveLength(2);
    expect(kf.activeVariationId).toBe("v1");
  });
});
