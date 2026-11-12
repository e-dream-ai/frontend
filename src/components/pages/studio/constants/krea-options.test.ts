import { describe, it, expect } from "vitest";
import { KREA_STYLE_SCALE_OPTIONS, styleScaleOptions } from "./krea-options";

describe("styleScaleOptions", () => {
  it("is the presets when the value is one of them", () => {
    expect(styleScaleOptions(2)).toBe(KREA_STYLE_SCALE_OPTIONS);
  });

  it("adds a value outside the presets in order", () => {
    expect(styleScaleOptions(2.5)).toEqual([
      0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4,
    ]);
  });
});
