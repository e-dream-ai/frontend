import { describe, it, expect } from "vitest";
import { clampSizeToAllowed } from "./size-options";

const QWEN_SIZES = ["1280*720", "1024*1024", "720*1280", "512*512"];

describe("clampSizeToAllowed", () => {
  it("keeps size if valid for the allowed list", () => {
    expect(clampSizeToAllowed("1280*720", QWEN_SIZES)).toBe("1280*720");
  });

  it("resets to first option when size is not allowed", () => {
    expect(clampSizeToAllowed("768*768", QWEN_SIZES)).toBe("1280*720");
  });

  it("resets to first option when size is nonsense", () => {
    expect(clampSizeToAllowed("nonsense", QWEN_SIZES)).toBe("1280*720");
  });

  it("keeps the current size when no options are loaded yet", () => {
    expect(clampSizeToAllowed("768*768", [])).toBe("768*768");
  });
});
