import { describe, expect, it } from "vitest";
import { CARD_THUMB, sizedImageUrl } from "./sized-image";

describe("sizedImageUrl", () => {
  it("asks the image worker for a signed image at the given width", () => {
    const url = new URL(
      sizedImageUrl("https://img.example.com/u/dream.webp?sig=abc", CARD_THUMB),
    );
    expect(url.searchParams.get("sig")).toBe("abc");
    expect(url.searchParams.get("w")).toBe("480");
    expect(url.searchParams.get("fit")).toBe("scale-down");
  });

  it("leaves anything the worker did not sign as it is", () => {
    for (const url of [
      "blob:http://localhost:5173/1234",
      "https://cdn.example.com/a.png",
      "https://bucket.r2.cloudflarestorage.com/a.png?X-Amz-Signature=x",
      "",
    ]) {
      expect(sizedImageUrl(url, CARD_THUMB)).toBe(url);
    }
  });
});
