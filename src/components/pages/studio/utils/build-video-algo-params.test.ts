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
  it("builds wan-i2v params without LoRAs (guidance never sent — ignored by the sampler)", () => {
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
    });
    expect(result).not.toHaveProperty("guidance");
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
      seed: -1,
      high_noise_loras: [{ path: "zoom.safetensors", scale: 1.0 }],
      low_noise_loras: [{ path: "detail.safetensors", scale: 0.5 }],
    });
    expect(result).not.toHaveProperty("guidance");
  });

  it("builds ltx-i2v params without LoRAs (guidance sent, steps worker-controlled)", () => {
    const result = buildVideoAlgoParams({
      model: "ltx-i2v",
      action: makeAction(),
      imageUuid: "img-uuid",
      imageSize: "1280*720",
      duration: 10,
      numInferenceSteps: 25,
      guidance: 2.5,
    });

    // The LTX worker fixes the step schedule; guidance is ours to set.
    expect(result).toEqual({
      infinidream_algorithm: "ltx-i2v",
      prompt: "slow zoom in",
      source_dream_uuid: "img-uuid",
      duration: 10,
      guidance: 2.5,
    });
    expect(result).not.toHaveProperty("num_inference_steps");
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
      source_dream_uuid: "img-uuid",
      duration: 10,
      guidance: 4.0,
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

  it("sends an explicit seed for ltx-i2v", () => {
    const result = buildVideoAlgoParams({
      model: "ltx-i2v",
      action: makeAction(),
      imageUuid: "img-uuid",
      imageSize: "1280*720",
      duration: 5,
      numInferenceSteps: 30,
      guidance: 1.0,
      seed: 42,
    });

    expect(result.seed).toBe(42);
  });

  it("omits seed for ltx-i2v when not provided", () => {
    const result = buildVideoAlgoParams({
      model: "ltx-i2v",
      action: makeAction(),
      imageUuid: "img-uuid",
      imageSize: "1280*720",
      duration: 5,
      numInferenceSteps: 30,
      guidance: 1.0,
    });

    expect(result).not.toHaveProperty("seed");
  });

  it("does not send seed for kling or wan", () => {
    const klingResult = buildVideoAlgoParams({
      model: "kling-i2v",
      action: makeAction(),
      imageUuid: "img-uuid",
      imageSize: "1280*720",
      duration: 5,
      numInferenceSteps: 30,
      guidance: 0.5,
      seed: 42,
    });
    expect(klingResult).not.toHaveProperty("seed");

    const wanResult = buildVideoAlgoParams({
      model: "wan-i2v",
      action: makeAction(),
      imageUuid: "img-uuid",
      imageSize: "1280*720",
      duration: 5,
      numInferenceSteps: 30,
      guidance: 5.0,
      seed: 42,
    });
    expect(wanResult).not.toHaveProperty("seed");
  });

  it("includes negative_prompt for ltx-i2v when provided", () => {
    const result = buildVideoAlgoParams({
      model: "ltx-i2v",
      action: makeAction(),
      imageUuid: "img-uuid",
      imageSize: "1280*720",
      duration: 5,
      numInferenceSteps: 30,
      guidance: 5.0,
      negativePrompt: "blurry, distorted, watermark",
    });

    expect(result).toEqual({
      infinidream_algorithm: "ltx-i2v",
      prompt: "slow zoom in",
      source_dream_uuid: "img-uuid",
      duration: 5,
      guidance: 5.0,
      negative_prompt: "blurry, distorted, watermark",
    });
  });

  it("omits negative_prompt when blank or whitespace-only", () => {
    const result = buildVideoAlgoParams({
      model: "ltx-i2v",
      action: makeAction(),
      imageUuid: "img-uuid",
      imageSize: "1280*720",
      duration: 5,
      numInferenceSteps: 30,
      guidance: 5.0,
      negativePrompt: "   ",
    });

    expect(result).not.toHaveProperty("negative_prompt");
  });

  it.each(["kling-i2v", "kling-25-i2v"] as const)(
    "sends guidance as cfg_scale for %s",
    (model) => {
      const result = buildVideoAlgoParams({
        model,
        action: makeAction(),
        imageUuid: "img-uuid",
        endImageUuid: "end-uuid",
        imageSize: "1280*720",
        duration: 5,
        numInferenceSteps: 30,
        guidance: 0.35,
      });

      expect(result).toEqual({
        infinidream_algorithm: model,
        prompt: "slow zoom in",
        source_dream_uuid: "img-uuid",
        end_source_uuid: "end-uuid",
        duration: 5,
        cfg_scale: 0.35,
      });
      expect(result).not.toHaveProperty("guidance");
    },
  );

  it("omits guidance when it is not a finite number", () => {
    const result = buildVideoAlgoParams({
      model: "ltx-i2v",
      action: makeAction(),
      imageUuid: "img-uuid",
      imageSize: "1280*720",
      duration: 5,
      numInferenceSteps: 30,
      guidance: Number.NaN,
    });

    expect(result).not.toHaveProperty("guidance");
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
