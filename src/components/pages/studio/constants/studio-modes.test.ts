import { describe, it, expect } from "vitest";
import { isStudioMode, STUDIO_MODES } from "./studio-modes";

describe("isStudioMode", () => {
  it("accepts every studio mode", () => {
    for (const mode of STUDIO_MODES) expect(isStudioMode(mode)).toBe(true);
  });

  it("rejects the old uprez editor, so its links 404", () => {
    expect(isStudioMode("uprez")).toBe(false);
  });

  it("rejects a missing or unknown editor", () => {
    expect(isStudioMode(undefined)).toBe(false);
    expect(isStudioMode("nope")).toBe(false);
  });
});
