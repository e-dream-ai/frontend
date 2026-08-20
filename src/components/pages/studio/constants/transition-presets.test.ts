import { describe, it, expect } from "vitest";
import { TRANSITION_PRESETS } from "./transition-presets";
import { ACTION_PRESETS } from "./action-presets";

describe("TRANSITION_PRESETS", () => {
  it("ships every transition from issue #722", () => {
    expect(TRANSITION_PRESETS).toHaveLength(18);
  });

  it("holds exactly one prompt-only action per pack", () => {
    for (const pack of TRANSITION_PRESETS) {
      expect(pack.actions).toHaveLength(1);
      expect(pack.actions[0].prompt.length).toBeGreaterThan(0);
      expect(pack.actions[0].highNoiseLoras).toBeUndefined();
      expect(pack.actions[0].lowNoiseLoras).toBeUndefined();
      expect(pack.model).toBe("all");
    }
  });

  it("carries a negative prompt only for the three transitions that need one", () => {
    const withNegative = TRANSITION_PRESETS.filter(
      (p) => p.actions[0].negativePrompt,
    ).map((p) => p.name);
    expect(withNegative).toEqual(["Morph", "Kaleidoscope", "Liquid"]);
  });

  it("groups the transformations ahead of the camera moves", () => {
    const transformations = TRANSITION_PRESETS.filter(
      (p) => p.group === "transformations",
    ).map((p) => p.name);
    expect(transformations).toEqual([
      "Morph",
      "Kaleidoscope",
      "Liquid",
      "Time-Lapse",
      "Match Cut",
      "Match on Action",
      "Light Flash Whiteout",
    ]);
    // Every remaining pack lands in the camera section.
    expect(TRANSITION_PRESETS.filter((p) => p.group === "camera")).toHaveLength(
      TRANSITION_PRESETS.length - transformations.length,
    );
  });

  it("does not collide with action preset names", () => {
    const actionNames = new Set(ACTION_PRESETS.map((p) => p.name));
    const names = TRANSITION_PRESETS.map((p) => p.name);
    for (const name of names) expect(actionNames.has(name)).toBe(false);
    expect(new Set(names).size).toBe(names.length);
  });
});
