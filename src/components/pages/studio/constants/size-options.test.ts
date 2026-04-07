import { describe, it, expect } from "vitest";
import { clampSizeToModel } from "./size-options";

describe("clampSizeToModel", () => {
  it("keeps size if valid for new model", () => {
    expect(clampSizeToModel("1280*720", "qwen-image")).toBe("1280*720");
  });

  it("resets to first option when size is invalid for new model", () => {
    // 768*768 is valid for z-image-turbo but NOT for qwen-image
    expect(clampSizeToModel("768*768", "qwen-image")).toBe("1280*720");
  });

  it("keeps ZIT-only sizes when switching to ZIT", () => {
    expect(clampSizeToModel("768*768", "z-image-turbo")).toBe("768*768");
  });

  it("resets to first ZIT size when size is invalid", () => {
    expect(clampSizeToModel("nonsense", "z-image-turbo")).toBe("1280*720");
  });
});
