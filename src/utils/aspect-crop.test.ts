import { describe, it, expect } from "vitest";
import {
  PRESET_RATIOS,
  ASPECT_RATIO_OPTIONS,
  parseAspectRatio,
  majorityPresetRatio,
  resolveFlowRatio,
  aspectRatioFromDimensions,
  nearestPresetRatio,
  defaultCenterCrop,
  clampCropRegion,
  cropRegionToPixels,
  sizeStringForRatio,
  cropSignature,
  isFullFrameCrop,
} from "./aspect-crop";

describe("aspectRatioFromDimensions", () => {
  it("returns width/height", () => {
    expect(aspectRatioFromDimensions(1920, 1080)).toBeCloseTo(16 / 9, 5);
    expect(aspectRatioFromDimensions(1080, 1920)).toBeCloseTo(9 / 16, 5);
    expect(aspectRatioFromDimensions(1000, 1000)).toBe(1);
  });
});

describe("parseAspectRatio", () => {
  it("parses presets to numeric ratios", () => {
    expect(parseAspectRatio("16:9")).toBeCloseTo(16 / 9, 5);
    expect(parseAspectRatio("9:16")).toBeCloseTo(9 / 16, 5);
    expect(parseAspectRatio("1:1")).toBe(1);
    expect(parseAspectRatio("4:3")).toBeCloseTo(4 / 3, 5);
    expect(parseAspectRatio("3:4")).toBeCloseTo(3 / 4, 5);
  });

  it("resolves auto from fallback dimensions (snapped to nearest preset)", () => {
    expect(parseAspectRatio("auto", { width: 1080, height: 1920 })).toBeCloseTo(
      9 / 16,
      5,
    );
    expect(parseAspectRatio("auto", { width: 1920, height: 1080 })).toBeCloseTo(
      16 / 9,
      5,
    );
  });

  it("falls back to 16:9 for auto with no dimensions", () => {
    expect(parseAspectRatio("auto")).toBeCloseTo(16 / 9, 5);
  });
});

describe("majorityPresetRatio", () => {
  const L = { width: 1920, height: 1080 }; // 16:9
  const P = { width: 1080, height: 1920 }; // 9:16
  const S = { width: 1000, height: 1000 }; // 1:1

  it("returns the most common shape (the oddball loses)", () => {
    expect(majorityPresetRatio([L, L, L, P])).toBe("16:9");
    expect(majorityPresetRatio([P, P, L])).toBe("9:16");
  });

  it("ignores frames without dimensions", () => {
    expect(majorityPresetRatio([undefined, L, undefined, L, P])).toBe("16:9");
  });

  it("breaks ties toward the earliest frame", () => {
    expect(majorityPresetRatio([P, L])).toBe("9:16");
    expect(majorityPresetRatio([L, P])).toBe("16:9");
    expect(majorityPresetRatio([S, L, P])).toBe("1:1");
  });

  it("returns undefined when nothing is known", () => {
    expect(majorityPresetRatio([undefined, undefined])).toBeUndefined();
    expect(majorityPresetRatio([])).toBeUndefined();
  });
});

describe("resolveFlowRatio", () => {
  const L = { width: 1920, height: 1080 };
  const P = { width: 1080, height: 1920 };

  it("uses an explicit preset when set", () => {
    expect(resolveFlowRatio([P, P, P], "16:9")).toBeCloseTo(16 / 9, 5);
  });

  it("uses the majority shape for auto", () => {
    expect(resolveFlowRatio([L, L, P], "auto")).toBeCloseTo(16 / 9, 5);
    expect(resolveFlowRatio([P, P, L], "auto")).toBeCloseTo(9 / 16, 5);
  });

  it("falls back to 16:9 for auto with no known dimensions", () => {
    expect(resolveFlowRatio([undefined], "auto")).toBeCloseTo(16 / 9, 5);
  });
});

describe("nearestPresetRatio", () => {
  it("snaps common resolutions to the right preset", () => {
    expect(nearestPresetRatio(1920, 1080)).toBe("16:9");
    expect(nearestPresetRatio(1080, 1920)).toBe("9:16");
    expect(nearestPresetRatio(1000, 1000)).toBe("1:1");
    expect(nearestPresetRatio(1024, 768)).toBe("4:3");
    expect(nearestPresetRatio(768, 1024)).toBe("3:4");
  });

  it("snaps off-ratio dimensions to the closest preset", () => {
    // 800x1000 = 0.8 -> closest to 3:4 (0.75)
    expect(nearestPresetRatio(800, 1000)).toBe("3:4");
    // 1600x900 = 1.777 -> 16:9
    expect(nearestPresetRatio(1600, 900)).toBe("16:9");
  });
});

describe("defaultCenterCrop", () => {
  it("returns a full-frame crop when source already matches target", () => {
    const c = defaultCenterCrop(1920, 1080, 16 / 9);
    expect(c.x).toBeCloseTo(0, 4);
    expect(c.y).toBeCloseTo(0, 4);
    expect(c.width).toBeCloseTo(1, 4);
    expect(c.height).toBeCloseTo(1, 4);
  });

  it("crops a square into a centered horizontal band for 16:9", () => {
    const c = defaultCenterCrop(1000, 1000, 16 / 9);
    expect(c.width).toBeCloseTo(1, 4);
    expect(c.height).toBeCloseTo(9 / 16, 4);
    expect(c.x).toBeCloseTo(0, 4);
    expect(c.y).toBeCloseTo((1 - 9 / 16) / 2, 4);
  });

  it("crops a square into a centered vertical band for 9:16", () => {
    const c = defaultCenterCrop(1000, 1000, 9 / 16);
    expect(c.height).toBeCloseTo(1, 4);
    expect(c.width).toBeCloseTo(9 / 16, 4);
    expect(c.y).toBeCloseTo(0, 4);
    expect(c.x).toBeCloseTo((1 - 9 / 16) / 2, 4);
  });

  it("crops a portrait source to a landscape band (the #668 case)", () => {
    // 1080x1920 portrait -> 16:9 landscape output
    const c = defaultCenterCrop(1080, 1920, 16 / 9);
    expect(c.width).toBeCloseTo(1, 4);
    const srcRatio = 1080 / 1920;
    expect(c.height).toBeCloseTo(srcRatio / (16 / 9), 4);
    expect(c.x).toBeCloseTo(0, 4);
    expect(c.y).toBeCloseTo((1 - c.height) / 2, 4);
  });

  it("produces a box whose pixel aspect matches the target", () => {
    const srcW = 1080;
    const srcH = 1920;
    const target = 16 / 9;
    const c = defaultCenterCrop(srcW, srcH, target);
    const pxRatio = (c.width * srcW) / (c.height * srcH);
    expect(pxRatio).toBeCloseTo(target, 3);
  });
});

describe("clampCropRegion", () => {
  it("keeps an in-bounds region unchanged (aspect already correct)", () => {
    const region = { x: 0, y: 0.21875, width: 1, height: 9 / 16 };
    const c = clampCropRegion(region, 1000, 1000, 16 / 9);
    expect(c.x).toBeCloseTo(0, 4);
    expect(c.width).toBeCloseTo(1, 4);
    expect(c.height).toBeCloseTo(9 / 16, 4);
  });

  it("re-derives height to satisfy the target aspect ratio", () => {
    // width 0.6 on a square source, target square -> height must equal 0.6
    const region = { x: 0.1, y: 0.1, width: 0.6, height: 0.1 };
    const c = clampCropRegion(region, 1000, 1000, 1);
    expect(c.height).toBeCloseTo(0.6, 4);
  });

  it("clamps position so the box stays within the source", () => {
    const region = { x: 0.9, y: 0.9, width: 0.5, height: 0.5 };
    const c = clampCropRegion(region, 1000, 1000, 1);
    expect(c.x).toBeCloseTo(0.5, 4);
    expect(c.y).toBeCloseTo(0.5, 4);
    expect(c.x + c.width).toBeLessThanOrEqual(1.0001);
    expect(c.y + c.height).toBeLessThanOrEqual(1.0001);
  });

  it("shrinks an oversized box to fit and re-centers", () => {
    const region = { x: -0.2, y: 0, width: 1.4, height: 1.4 };
    const c = clampCropRegion(region, 1000, 1000, 1);
    expect(c.width).toBeLessThanOrEqual(1.0001);
    expect(c.height).toBeLessThanOrEqual(1.0001);
    expect(c.x).toBeGreaterThanOrEqual(-0.0001);
    expect(c.y).toBeGreaterThanOrEqual(-0.0001);
  });
});

describe("cropRegionToPixels", () => {
  it("converts a normalized region to integer source pixels", () => {
    const px = cropRegionToPixels(
      { x: 0.25, y: 0, width: 0.5, height: 1 },
      1000,
      1000,
    );
    expect(px).toEqual({ sx: 250, sy: 0, sw: 500, sh: 1000 });
  });

  it("clamps to image bounds and rounds", () => {
    const px = cropRegionToPixels(
      { x: 0.3333, y: 0.3333, width: 0.5, height: 0.5 },
      1920,
      1080,
    );
    expect(px.sx).toBe(640);
    expect(px.sy).toBe(360);
    expect(px.sx + px.sw).toBeLessThanOrEqual(1920);
    expect(px.sy + px.sh).toBeLessThanOrEqual(1080);
  });
});

describe("sizeStringForRatio", () => {
  it("maps each preset ratio to its nearest supported generation bucket", () => {
    expect(sizeStringForRatio(16 / 9)).toBe("1280*720");
    expect(sizeStringForRatio(9 / 16)).toBe("720*1280");
    expect(sizeStringForRatio(1)).toBe("1280*1280");
    expect(sizeStringForRatio(4 / 3)).toBe("1024*768");
    expect(sizeStringForRatio(3 / 4)).toBe("768*1024");
  });
});

describe("cropSignature", () => {
  it("is stable for equal inputs", () => {
    const r = { x: 0.1, y: 0.2, width: 0.5, height: 0.5 };
    expect(cropSignature("dream-a", r, 1)).toBe(cropSignature("dream-a", r, 1));
  });

  it("changes when the source, region, or ratio changes", () => {
    const r = { x: 0.1, y: 0.2, width: 0.5, height: 0.5 };
    const base = cropSignature("dream-a", r, 1);
    expect(cropSignature("dream-b", r, 1)).not.toBe(base);
    expect(cropSignature("dream-a", { ...r, x: 0.11 }, 1)).not.toBe(base);
    expect(cropSignature("dream-a", r, 16 / 9)).not.toBe(base);
  });
});

describe("isFullFrameCrop", () => {
  it("is true for a full-frame region", () => {
    expect(isFullFrameCrop({ x: 0, y: 0, width: 1, height: 1 })).toBe(true);
  });

  it("is false when the region is a sub-rect", () => {
    expect(isFullFrameCrop({ x: 0, y: 0.2, width: 1, height: 0.5625 })).toBe(
      false,
    );
  });
});

describe("PRESET_RATIOS / ASPECT_RATIO_OPTIONS", () => {
  it("exposes the five presets plus auto", () => {
    expect(Object.keys(PRESET_RATIOS)).toEqual([
      "16:9",
      "9:16",
      "1:1",
      "4:3",
      "3:4",
    ]);
    expect(ASPECT_RATIO_OPTIONS).toContain("auto");
    expect(ASPECT_RATIO_OPTIONS).toContain("16:9");
  });
});
