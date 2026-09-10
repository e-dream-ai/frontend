import { describe, it, expect } from "vitest";
import { isNoOpUprez } from "../utils/uprez-playlist-prompt";

describe("isNoOpUprez", () => {
  it("flags 1x on both factors, which would just copy the source", () => {
    expect(isNoOpUprez(1, 1)).toBe(true);
  });

  it("allows 1x on exactly one factor", () => {
    expect(isNoOpUprez(1, 2)).toBe(false);
    expect(isNoOpUprez(2, 1)).toBe(false);
  });

  it("allows both factors above 1x", () => {
    expect(isNoOpUprez(4, 8)).toBe(false);
  });
});
