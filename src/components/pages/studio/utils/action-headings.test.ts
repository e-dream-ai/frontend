import { describe, expect, it } from "vitest";
import type { StudioAction } from "../../../../types/studio.types";
import { actionHeadings } from "./action-headings";

const actions = (...prompts: string[]): StudioAction[] =>
  prompts.map((prompt, i) => ({ id: `a${i}`, prompt }));

describe("actionHeadings", () => {
  it("names the first action by its first meaningful words", () => {
    expect(
      actionHeadings(actions("The camera slowly pushes in on the subject")),
    ).toEqual(["camera slowly pushes"]);
  });

  it("names a later action by the words it added", () => {
    const base =
      "everyone celebrates the arrival of the singularity. the central character is transmogrified into a column of pure light.";
    const edited =
      "everyone celebrates the arrival of the singularity. the central character shines and ascends into the sky.";
    expect(actionHeadings(actions(base, edited))).toEqual([
      "everyone celebrates",
      "shines ascends sky",
    ]);
  });

  it("falls back to its own words when it adds nothing new", () => {
    expect(
      actionHeadings(actions("dolly in slowly", "slowly dolly in")),
    ).toEqual(["dolly slowly", "slowly dolly"]);
  });

  it("keeps earlier headings when a column is added", () => {
    const before = actionHeadings(actions("zoom out wide", "pan left fast"));
    const after = actionHeadings(
      actions("zoom out wide", "pan left fast", "zoom out wide, rain"),
    );
    expect(after.slice(0, 2)).toEqual(before);
    expect(after[2]).toBe("rain");
  });

  it("stops before a heading gets long", () => {
    const [heading] = actionHeadings(
      actions("transmogrification metamorphosis kaleidoscopic"),
    );
    expect(heading).toBe("transmogrification");
  });

  it("names a copy that only changed its LoRA by the LoRA", () => {
    const list = actions(
      "dolly in slowly",
      "dolly in slowly",
      "dolly in slowly",
    );
    list[0].highNoiseLoras = [{ path: "static", scale: 1 }];
    list[1].highNoiseLoras = [{ path: "jib", scale: 1 }];
    list[2].highNoiseLoras = [{ path: "jib", scale: 1 }];
    const labels: Record<string, string> = { static: "Static", jib: "Jib Up" };
    expect(
      actionHeadings(list, (a) => labels[a.highNoiseLoras?.[0]?.path ?? ""]),
    ).toEqual(["dolly slowly", "Jib Up", "dolly slowly"]);
  });
});
