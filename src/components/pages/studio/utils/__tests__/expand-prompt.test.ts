// src/components/pages/studio/utils/__tests__/expand-prompt.test.ts
import { describe, it, expect } from "vitest";
import { expandPrompt, countExpansions } from "../expand-prompt";

describe("expandPrompt", () => {
  it("returns single-element array for plain text", () => {
    expect(expandPrompt("hello world")).toEqual(["hello world"]);
  });

  it("expands a single {A|B|C} group", () => {
    expect(expandPrompt("{fire|water|earth} elemental")).toEqual([
      "fire elemental",
      "water elemental",
      "earth elemental",
    ]);
  });

  it("computes cross-product of two groups", () => {
    const result = expandPrompt("{fire|water} {dragon|phoenix}");
    expect(result).toEqual([
      "fire dragon",
      "fire phoenix",
      "water dragon",
      "water phoenix",
    ]);
  });

  it("handles mixed static and dynamic parts", () => {
    expect(expandPrompt("a {B|C} d")).toEqual(["a B d", "a C d"]);
  });

  it("handles escaped braces", () => {
    expect(expandPrompt("\\{not expanded\\}")).toEqual(["{not expanded}"]);
  });

  it("handles single option in braces (no pipe)", () => {
    expect(expandPrompt("{solo}")).toEqual(["solo"]);
  });

  it("handles empty string", () => {
    expect(expandPrompt("")).toEqual([""]);
  });

  it("trims whitespace in options", () => {
    expect(expandPrompt("{ fire | water }")).toEqual(["fire", "water"]);
  });

  it("handles three groups cross-product", () => {
    const result = expandPrompt("{a|b} {x|y} {1|2}");
    expect(result).toHaveLength(8);
    expect(result).toContain("a x 1");
    expect(result).toContain("b y 2");
  });

  it("caps at 16 expansions", () => {
    const result = expandPrompt("{a|b|c} {x|y|z} {1|2|3}");
    expect(result).toHaveLength(16);
  });
});

describe("countExpansions", () => {
  it("returns 1 for plain text", () => {
    expect(countExpansions("no expansions here")).toBe(1);
  });

  it("returns option count for single group", () => {
    expect(countExpansions("{a|b|c}")).toBe(3);
  });

  it("returns cross-product count for multiple groups", () => {
    expect(countExpansions("{a|b} {x|y|z}")).toBe(6);
  });

  it("caps count at 16", () => {
    expect(countExpansions("{a|b|c} {x|y|z} {1|2|3}")).toBe(16);
  });
});
