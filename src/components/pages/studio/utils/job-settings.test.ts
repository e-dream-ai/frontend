import { describe, expect, it } from "vitest";
import type { VideoGenParams } from "../../../../types/studio.types";
import {
  settingsDiffer,
  settingsFromDreamPrompt,
  settingsPatch,
} from "./job-settings";

const panel: VideoGenParams = {
  model: "ltx-i2v",
  duration: 5,
  numInferenceSteps: 30,
  guidance: 3,
  seed: -1,
};

describe("settingsFromDreamPrompt", () => {
  it("reads LTX params back out of the dream's prompt", () => {
    const prompt = JSON.stringify({
      infinidream_algorithm: "ltx-i2v",
      duration: 8,
      guidance: 2.5,
      seed: 42,
    });
    expect(settingsFromDreamPrompt(prompt)).toEqual({
      model: "ltx-i2v",
      duration: 8,
      guidance: 2.5,
      seed: 42,
    });
  });

  it("reads Kling's cfg_scale as guidance and wan-i2v-lora as Wan", () => {
    expect(
      settingsFromDreamPrompt({
        infinidream_algorithm: "kling-i2v",
        duration: 10,
        cfg_scale: 0.5,
      }),
    ).toEqual({ model: "kling-i2v", duration: 10, guidance: 0.5 });
    expect(
      settingsFromDreamPrompt({
        infinidream_algorithm: "wan-i2v-lora",
        num_inference_steps: 20,
      })?.model,
    ).toBe("wan-i2v");
  });

  it("gives up on anything it cannot parse", () => {
    expect(settingsFromDreamPrompt("not json")).toBeUndefined();
    expect(settingsFromDreamPrompt({ infinidream_algorithm: "x" })).toBe(
      undefined,
    );
  });
});

describe("settingsDiffer", () => {
  it("compares only the fields the clip's model uses", () => {
    // Steps mean nothing to LTX.
    expect(settingsDiffer({ ...panel, numInferenceSteps: 20 }, panel)).toBe(
      false,
    );
    expect(settingsDiffer({ ...panel, guidance: 4 }, panel)).toBe(true);
    expect(settingsDiffer({ ...panel, model: "wan-i2v" }, panel)).toBe(true);
  });

  it("does not count a field the clip has no record of", () => {
    expect(settingsDiffer({ model: "ltx-i2v" }, panel)).toBe(false);
  });
});

describe("settingsPatch", () => {
  it("loads only what the clip recorded for its model", () => {
    expect(
      settingsPatch({ model: "wan-i2v", duration: 8, guidance: 9 }),
    ).toEqual({ model: "wan-i2v", duration: 8 });
  });
});
