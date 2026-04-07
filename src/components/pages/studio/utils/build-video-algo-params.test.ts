import { describe, it, expect } from "vitest";
import { buildVideoAlgoParams } from "./build-video-algo-params";
import type { StudioAction } from "@/types/studio.types";

const makeAction = (overrides: Partial<StudioAction> = {}): StudioAction => ({
  id: "act1",
  prompt: "slow zoom in",
  enabled: true,
  ...overrides,
});

describe("buildVideoAlgoParams", () => {
  it("builds wan-i2v params without LoRAs", () => {
    const result = buildVideoAlgoParams({
      model: "wan-i2v",
      action: makeAction(),
      imageUuid: "img-uuid",
      imageSize: "1280*720",
      duration: 5,
      numInferenceSteps: 30,
      guidance: 5.0,
    });

    expect(result).toEqual({
      infinidream_algorithm: "wan-i2v",
      prompt: "slow zoom in",
      image: "img-uuid",
      size: "1280*720",
      duration: 5,
      num_inference_steps: 30,
      guidance: 5.0,
    });
  });

  it("builds wan-i2v-lora params with LoRAs", () => {
    const action = makeAction({
      highNoiseLoras: [{ path: "zoom.safetensors", scale: 1.0 }],
      lowNoiseLoras: [{ path: "detail.safetensors", scale: 0.5 }],
    });

    const result = buildVideoAlgoParams({
      model: "wan-i2v",
      action,
      imageUuid: "img-uuid",
      imageSize: "1280*720",
      duration: 5,
      numInferenceSteps: 30,
      guidance: 5.0,
    });

    expect(result).toEqual({
      infinidream_algorithm: "wan-i2v-lora",
      prompt: "slow zoom in",
      image: "img-uuid",
      duration: 5,
      num_inference_steps: 30,
      guidance: 5.0,
      seed: -1,
      high_noise_loras: [{ path: "zoom.safetensors", scale: 1.0 }],
      low_noise_loras: [{ path: "detail.safetensors", scale: 0.5 }],
    });
  });

  it("builds ltx-i2v params without LoRAs (no steps/guidance — worker controls these)", () => {
    const result = buildVideoAlgoParams({
      model: "ltx-i2v",
      action: makeAction(),
      imageUuid: "img-uuid",
      imageSize: "1280*720",
      duration: 10,
      numInferenceSteps: 25,
      guidance: 4.0,
    });

    // LTX worker handles steps/guidance internally
    expect(result).toEqual({
      infinidream_algorithm: "ltx-i2v",
      prompt: "slow zoom in",
      image: "img-uuid",
      duration: 10,
    });
    expect(result).not.toHaveProperty("num_inference_steps");
    expect(result).not.toHaveProperty("guidance");
  });

  it("builds ltx-i2v params WITH high_noise_loras (worker uses first LoRA only)", () => {
    const action = makeAction({
      highNoiseLoras: [
        {
          path: "ltx-2-19b-lora-camera-control-static.safetensors",
          scale: 0.4,
        },
      ],
    });

    const result = buildVideoAlgoParams({
      model: "ltx-i2v",
      action,
      imageUuid: "img-uuid",
      imageSize: "1280*720",
      duration: 10,
      numInferenceSteps: 25,
      guidance: 4.0,
    });

    expect(result).toEqual({
      infinidream_algorithm: "ltx-i2v",
      prompt: "slow zoom in",
      image: "img-uuid",
      duration: 10,
      high_noise_loras: [
        {
          path: "ltx-2-19b-lora-camera-control-static.safetensors",
          scale: 0.4,
        },
      ],
    });
    // Worker only reads high_noise_loras, not low_noise_loras
    expect(result).not.toHaveProperty("low_noise_loras");
  });

  it("does not send high_noise_loras for LTX when action has only low_noise_loras", () => {
    const action = makeAction({
      lowNoiseLoras: [{ path: "some-lora.safetensors", scale: 0.3 }],
    });

    const result = buildVideoAlgoParams({
      model: "ltx-i2v",
      action,
      imageUuid: "img-uuid",
      imageSize: "1280*720",
      duration: 5,
      numInferenceSteps: 30,
      guidance: 5.0,
    });

    // LTX only uses high_noise_loras — low_noise_loras are Wan-only
    expect(result).not.toHaveProperty("high_noise_loras");
    expect(result).not.toHaveProperty("low_noise_loras");
  });

  it("defaults imageSize to 1280*720 when empty for wan-i2v", () => {
    const result = buildVideoAlgoParams({
      model: "wan-i2v",
      action: makeAction(),
      imageUuid: "img-uuid",
      imageSize: undefined,
      duration: 5,
      numInferenceSteps: 30,
      guidance: 5.0,
    });

    expect(result.size).toBe("1280*720");
  });
});
