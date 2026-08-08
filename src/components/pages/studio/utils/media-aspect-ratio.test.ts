import { describe, it, expect } from "vitest";
import { mediaAspectRatio } from "./media-aspect-ratio";

describe("mediaAspectRatio", () => {
  it("builds a CSS aspect-ratio from recorded dimensions", () => {
    expect(mediaAspectRatio(1392, 752)).toBe("1392 / 752");
    expect(mediaAspectRatio(720, 1280)).toBe("720 / 1280");
    expect(mediaAspectRatio(512, 512)).toBe("512 / 512");
  });

  it("returns undefined when either dimension is missing", () => {
    expect(mediaAspectRatio(undefined, undefined)).toBeUndefined();
    expect(mediaAspectRatio(1280, undefined)).toBeUndefined();
    expect(mediaAspectRatio(undefined, 720)).toBeUndefined();
    expect(mediaAspectRatio(null, null)).toBeUndefined();
  });

  it("returns undefined for degenerate dimensions rather than an invalid ratio", () => {
    expect(mediaAspectRatio(0, 720)).toBeUndefined();
    expect(mediaAspectRatio(1280, 0)).toBeUndefined();
    expect(mediaAspectRatio(-1280, 720)).toBeUndefined();
  });
});
