import { describe, it, expect } from "vitest";
import {
  matchingPresetName,
  presetSettingsPatch,
  resolvePresetAction,
  settingsToAction,
} from "../resolve-flow-settings";
// Relative, not "@/": the alias does not resolve for value imports in tests.
import { DEFAULT_TRANSITION_SETTINGS } from "../../constants/default-transition-settings";
import { ACTION_PRESETS } from "../../constants/action-presets";

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

describe("presetSettingsPatch", () => {
  it("stamps prompt, negative prompt and both LoRA sets", () => {
    const action = resolvePresetAction("Abstract")!;
    expect(presetSettingsPatch("Abstract")).toEqual({
      prompt: action.prompt,
      negativePrompt: action.negativePrompt ?? "",
      highNoiseLoras: action.highNoiseLoras ?? [],
      lowNoiseLoras: action.lowNoiseLoras ?? [],
    });
  });

  it("writes an empty negative prompt for a preset without one", () => {
    // Otherwise the previous preset's negative would ride along invisibly.
    expect(presetSettingsPatch("Abstract")?.negativePrompt).toBe("");
  });

  it("carries a preset's LoRAs as a pair", () => {
    const withLora = ACTION_PRESETS.find((p) =>
      p.actions.some((a) => a.highNoiseLoras?.length),
    );
    if (!withLora) return;
    const patch = presetSettingsPatch(withLora.name)!;
    const action = resolvePresetAction(withLora.name)!;
    expect(patch.highNoiseLoras).toEqual(action.highNoiseLoras ?? []);
    expect(patch.lowNoiseLoras).toEqual(action.lowNoiseLoras ?? []);
  });

  it("is undefined for an unknown or empty preset", () => {
    expect(presetSettingsPatch("nope")).toBeUndefined();
    expect(presetSettingsPatch("")).toBeUndefined();
  });

  it("writes values, leaving no trace of which preset ran", () => {
    // A preset is an action now: nothing stores its name, so nothing can
    // resolve through it later.
    expect(Object.keys(presetSettingsPatch("Abstract")!).sort()).toEqual([
      "highNoiseLoras",
      "lowNoiseLoras",
      "negativePrompt",
      "prompt",
    ]);
  });
});

describe("matchingPresetName", () => {
  const packs = ACTION_PRESETS.filter((p) => p.model === "all");
  const abstract = ACTION_PRESETS.find((p) => p.name === "Abstract")!;

  it("names the preset whose values the settings still match", () => {
    const settings = {
      ...DEFAULT_TRANSITION_SETTINGS,
      ...presetSettingsPatch("Abstract"),
    };
    expect(matchingPresetName(settings, [abstract])).toBe("Abstract");
  });

  it("reports no match once the prompt is edited away", () => {
    // Stricter than the old stored preset id, which kept claiming the preset
    // after the prompt had been rewritten.
    const settings = {
      ...DEFAULT_TRANSITION_SETTINGS,
      ...presetSettingsPatch("Abstract"),
      prompt: "something else",
    };
    expect(matchingPresetName(settings, [abstract])).toBe("");
  });

  it("reports no match when only the LoRAs differ", () => {
    const settings = {
      ...DEFAULT_TRANSITION_SETTINGS,
      ...presetSettingsPatch("Abstract"),
      highNoiseLoras: [{ path: "other.safetensors", scale: 1 }],
    };
    expect(matchingPresetName(settings, [abstract])).toBe("");
  });

  it("ignores fields a preset does not write", () => {
    // Duration, seed and the rest are not part of a preset, so changing them
    // must not knock the settings out of the match.
    const settings = {
      ...DEFAULT_TRANSITION_SETTINGS,
      ...presetSettingsPatch("Abstract"),
      duration: 10,
      seed: 42,
      guidance: 9,
    };
    expect(matchingPresetName(settings, [abstract])).toBe("Abstract");
  });

  it("is empty when nothing in the list matches", () => {
    const settings = { ...DEFAULT_TRANSITION_SETTINGS, prompt: "unique" };
    expect(matchingPresetName(settings, packs)).toBe("");
  });

  it("only ever returns a name from the list it was given", () => {
    // The panel feeds it the presets for the current model, so the result is
    // always an option the dropdown actually has.
    const name = matchingPresetName(
      { ...DEFAULT_TRANSITION_SETTINGS, ...presetSettingsPatch("Abstract") },
      packs,
    );
    if (name) expect(packs.map((p) => p.name)).toContain(name);
  });
});

describe("settingsToAction", () => {
  it("passes the stored fields straight through", () => {
    const settings = {
      ...DEFAULT_TRANSITION_SETTINGS,
      prompt: "swirl",
      highNoiseLoras: [{ path: "a.safetensors", scale: 1 }],
      lowNoiseLoras: [{ path: "b.safetensors", scale: 1 }],
    };
    expect(settingsToAction(settings)).toEqual({
      prompt: "swirl",
      highNoiseLoras: settings.highNoiseLoras,
      lowNoiseLoras: settings.lowNoiseLoras,
    });
  });

  it("keeps the low-noise set without matching it back to a preset", () => {
    // The old resolver recovered lowNoiseLoras only when the high-noise set
    // still matched the preset it came from; now it is simply stored.
    const settings = {
      ...DEFAULT_TRANSITION_SETTINGS,
      highNoiseLoras: [{ path: "custom.safetensors", scale: 1 }],
      lowNoiseLoras: [{ path: "custom-low.safetensors", scale: 1 }],
    };
    expect(settingsToAction(settings).lowNoiseLoras).toEqual(
      settings.lowNoiseLoras,
    );
  });
});
