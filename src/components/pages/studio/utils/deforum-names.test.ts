import { describe, expect, it } from "vitest";
import type { DeforumClip } from "../../../../types/deforum.types";
import { deforumClipNames } from "./deforum-names";

const clip = (...texts: string[]): DeforumClip =>
  ({
    id: texts.join("|"),
    name: "",
    settings: {
      prompts: texts.map((text, i) => ({ id: String(i), frame: i * 10, text })),
    },
  }) as unknown as DeforumClip;

describe("deforumClipNames", () => {
  it("names a clip by its first meaningful words", () => {
    expect(deforumClipNames([clip("a mantis priest in the dark")])).toEqual([
      "mantis priest dark",
    ]);
  });

  it("ignores LoRA tags, their trigger words and backtick weights", () => {
    expect(
      deforumClipNames([
        clip(
          "<lora:ral-frctlgmtry:0.3> <lora:trichom-style:0.5> ral-frctlgmtry, ral-trichom, (mantis:`0.5+0.5*cos(t/1000)`) priest",
        ),
      ]),
    ).toEqual(["mantis priest"]);
  });

  it("names a clip sharing a name by the words it adds", () => {
    expect(
      deforumClipNames([
        clip("mantis priest", "dance party"),
        clip("mantis priest", "moth swarm"),
      ]),
    ).toEqual(["mantis priest dance", "mantis priest moth"]);
  });

  it("numbers clips with nothing new to say", () => {
    expect(
      deforumClipNames([clip("mantis priest"), clip("mantis priest")]),
    ).toEqual(["mantis priest", "mantis priest 2"]);
  });

  it("falls back when a clip has no prompt text yet", () => {
    expect(deforumClipNames([clip(""), clip("")])).toEqual([
      "Dream",
      "Dream 2",
    ]);
  });
});
