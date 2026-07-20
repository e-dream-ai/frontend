import { describe, it, expect } from "vitest";
import { clampSizeToAllowed, formatSizeLabel, parseSize } from "./size-options";

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

describe("parseSize", () => {
  it("parses star-separated sizes", () => {
    expect(parseSize("1280*720")).toEqual({ width: 1280, height: 720 });
  });

  it("parses x-separated sizes", () => {
    expect(parseSize("512x512")).toEqual({ width: 512, height: 512 });
  });

  it("parses unicode multiplication sign", () => {
    expect(parseSize("720×1280")).toEqual({ width: 720, height: 1280 });
  });

  it("returns null for nonsense", () => {
    expect(parseSize("nonsense")).toBeNull();
    expect(parseSize("")).toBeNull();
    expect(parseSize("0*720")).toBeNull();
  });
});

describe("formatSizeLabel", () => {
  it("replaces the star separator with x", () => {
    expect(formatSizeLabel("1280*720")).toBe("1280x720");
  });

  it("leaves x-separated sizes unchanged", () => {
    expect(formatSizeLabel("512x512")).toBe("512x512");
  });
});
