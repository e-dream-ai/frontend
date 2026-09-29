import { describe, expect, it } from "vitest";
import { imageNames } from "./image-names";

describe("imageNames", () => {
  const prompt = "A tiger prowling in a misty jungle at dawn";

  it("heads a frame with its prompt's first meaningful words", () => {
    expect(imageNames(prompt, 1, [])).toEqual(["tiger prowling misty"]);
  });

  it("numbers a batch from one prompt", () => {
    expect(imageNames(prompt, 3, [])).toEqual([
      "tiger prowling misty",
      "tiger prowling misty 2",
      "tiger prowling misty 3",
    ]);
  });

  it("carries on the numbers when the same prompt is generated again", () => {
    const existing = [
      { name: "tiger prowling misty", prompt },
      { name: "tiger prowling misty 2", prompt },
    ];
    expect(imageNames(prompt, 2, existing)).toEqual([
      "tiger prowling misty 3",
      "tiger prowling misty 4",
    ]);
  });

  it("fills a gap left by a removed frame", () => {
    const existing = [{ name: "tiger prowling misty 2", prompt }];
    expect(imageNames(prompt, 1, existing)).toEqual(["tiger prowling misty"]);
  });

  it("names a remix by the words it added", () => {
    const existing = [{ name: "tiger prowling misty", prompt }];
    const remix = `${prompt}, glowing orange eyes`;
    expect(imageNames(remix, 2, existing)).toEqual([
      "glowing orange eyes",
      "glowing orange eyes 2",
    ]);
  });

  it("numbers a clash that adds no words of its own", () => {
    const existing = [{ name: "tiger prowling misty", prompt }];
    expect(imageNames("tiger prowling misty jungle dawn", 1, existing)).toEqual(
      ["tiger prowling misty 2"],
    );
  });

  it("treats a frame with no recorded prompt as another prompt", () => {
    // Only its name's words are known to be taken.
    const existing = [{ name: "tiger prowling misty" }];
    expect(imageNames(`${prompt} in rain`, 1, existing)).toEqual([
      "jungle dawn rain",
    ]);
  });

  it("falls back to a plain name for a prompt with no meaningful words", () => {
    expect(imageNames("a the of", 2, [])).toEqual(["Image", "Image 2"]);
  });
});
