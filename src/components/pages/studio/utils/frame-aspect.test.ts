import { describe, it, expect } from "vitest";
import type { FlowReferenceFrame } from "@/types/flow.types";
import {
  aspectRatioOf,
  ratiosMatch,
  isTransitionMismatched,
  dimensionsLabel,
} from "./frame-aspect";

const frame = (
  naturalWidth?: number,
  naturalHeight?: number,
): FlowReferenceFrame => ({
  id: "id",
  imageUrl: "http://example.test/i.png",
  name: "frame",
  naturalWidth,
  naturalHeight,
});

describe("aspectRatioOf", () => {
  it("derives the ratio from natural dimensions", () => {
    expect(aspectRatioOf(frame(1280, 720))).toBeCloseTo(16 / 9);
    expect(aspectRatioOf(frame(720, 1280))).toBeCloseTo(9 / 16);
    expect(aspectRatioOf(frame(512, 512))).toBe(1);
  });

  it("is undefined until dimensions are known", () => {
    expect(aspectRatioOf(frame())).toBeUndefined();
    expect(aspectRatioOf(frame(1280, undefined))).toBeUndefined();
    expect(aspectRatioOf(undefined)).toBeUndefined();
  });

  it("is undefined for degenerate dimensions rather than 0 or Infinity", () => {
    expect(aspectRatioOf(frame(0, 720))).toBeUndefined();
    expect(aspectRatioOf(frame(1280, 0))).toBeUndefined();
  });
});

describe("ratiosMatch", () => {
  it("treats encoder rounding as the same shape", () => {
    expect(ratiosMatch(1280 / 720, 1920 / 1080)).toBe(true);
    expect(ratiosMatch(1280 / 720, 1360 / 768)).toBe(true);
    expect(ratiosMatch(1280 / 720, 1280 / 719)).toBe(true);
  });

  it("separates genuinely different shapes", () => {
    expect(ratiosMatch(16 / 9, 1)).toBe(false);
    expect(ratiosMatch(16 / 9, 9 / 16)).toBe(false);
    expect(ratiosMatch(4 / 3, 16 / 9)).toBe(false);
  });
});

describe("isTransitionMismatched", () => {
  it("flags a transition between different shapes", () => {
    expect(isTransitionMismatched(frame(1280, 720), frame(720, 1280))).toBe(
      true,
    );
    expect(isTransitionMismatched(frame(1024, 1024), frame(1280, 720))).toBe(
      true,
    );
  });

  it("accepts matching shapes at different resolutions", () => {
    expect(isTransitionMismatched(frame(1280, 720), frame(1920, 1080))).toBe(
      false,
    );
  });

  it("never flags a frame whose dimensions are not known yet", () => {
    expect(isTransitionMismatched(frame(1280, 720), frame())).toBe(false);
    expect(isTransitionMismatched(frame(), frame(720, 1280))).toBe(false);
    expect(isTransitionMismatched(frame(), frame())).toBe(false);
    expect(isTransitionMismatched(undefined, frame(1280, 720))).toBe(false);
  });
});

describe("dimensionsLabel", () => {
  it("formats known dimensions", () => {
    expect(dimensionsLabel(frame(1280, 720))).toBe("1280x720");
  });

  it("is undefined when dimensions are unknown", () => {
    expect(dimensionsLabel(frame())).toBeUndefined();
  });
});
