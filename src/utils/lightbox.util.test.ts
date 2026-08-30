import { describe, it, expect } from "vitest";
import {
  clampLightboxIndex,
  stepLightboxIndex,
  canStep,
} from "./lightbox.util";

describe("lightbox.util", () => {
  describe("clampLightboxIndex", () => {
    it("returns null when there are no reference frames", () => {
      expect(clampLightboxIndex(0, 0)).toBeNull();
      expect(clampLightboxIndex(3, 0)).toBeNull();
    });

    it("clamps below zero to the first index", () => {
      expect(clampLightboxIndex(-2, 5)).toBe(0);
    });

    it("clamps past the end to the last index", () => {
      expect(clampLightboxIndex(9, 5)).toBe(4);
    });

    it("passes an in-range index through unchanged", () => {
      expect(clampLightboxIndex(2, 5)).toBe(2);
    });
  });

  describe("stepLightboxIndex", () => {
    it("returns null when the lightbox is closed", () => {
      expect(stepLightboxIndex(null, 1, 5)).toBeNull();
    });

    it("advances to the next index", () => {
      expect(stepLightboxIndex(1, 1, 5)).toBe(2);
    });

    it("goes back to the previous index", () => {
      expect(stepLightboxIndex(3, -1, 5)).toBe(2);
    });

    it("clamps at the last index instead of wrapping", () => {
      expect(stepLightboxIndex(4, 1, 5)).toBe(4);
    });

    it("clamps at the first index instead of wrapping", () => {
      expect(stepLightboxIndex(0, -1, 5)).toBe(0);
    });
  });

  describe("canStep", () => {
    it("is false when the lightbox is closed", () => {
      expect(canStep(null, 1, 5)).toBe(false);
    });

    it("is false stepping back from the first index", () => {
      expect(canStep(0, -1, 5)).toBe(false);
    });

    it("is false stepping forward from the last index", () => {
      expect(canStep(4, 1, 5)).toBe(false);
    });

    it("is true stepping within range", () => {
      expect(canStep(2, 1, 5)).toBe(true);
      expect(canStep(2, -1, 5)).toBe(true);
    });

    it("is false with a single reference frame", () => {
      expect(canStep(0, 1, 1)).toBe(false);
      expect(canStep(0, -1, 1)).toBe(false);
    });
  });
});
