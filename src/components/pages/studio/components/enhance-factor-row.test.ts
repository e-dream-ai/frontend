import { describe, it, expect } from "vitest";
import { isNoOpEnhance } from "../utils/enhance-playlist-prompt";

describe("isNoOpEnhance", () => {
  it("flags 1x on both factors, which would just copy the source", () => {
    expect(isNoOpEnhance(1, 1)).toBe(true);
  });

  it("allows 1x on exactly one factor", () => {
    expect(isNoOpEnhance(1, 2)).toBe(false);
    expect(isNoOpEnhance(2, 1)).toBe(false);
  });

  it("allows both factors above 1x", () => {
    expect(isNoOpEnhance(4, 8)).toBe(false);
  });
});
