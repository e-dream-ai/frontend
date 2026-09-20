import { describe, it, expect } from "vitest";
import type { FlowTransition, TransitionSettings } from "@/types/flow.types";
import {
  fieldComparisonKey,
  forcedFieldPatch,
  mismatchedFields,
  selectionHasMismatch,
} from "./transition-field-values";
// Relative, not "@/": the alias does not resolve for value imports in tests.
import { DEFAULT_TRANSITION_SETTINGS } from "../constants/default-transition-settings";

const t = (settings: Partial<TransitionSettings> = {}): FlowTransition => ({
  fromFrameId: "a",
  toFrameId: "b",
  status: "idle",
  settings: { ...DEFAULT_TRANSITION_SETTINGS, ...settings },
});

const LORA = [{ path: "x.safetensors", scale: 1 }];

describe("fieldComparisonKey", () => {
  it("collapses LoRA arrays to their paths", () => {
    expect(fieldComparisonKey(LORA)).toBe("x.safetensors");
  });

  it("treats undefined and an empty LoRA list alike", () => {
    expect(fieldComparisonKey(undefined)).toBe("");
    expect(fieldComparisonKey([])).toBe("");
  });

  it("does not conflate different numbers", () => {
    expect(fieldComparisonKey(5)).not.toBe(fieldComparisonKey(8));
  });
});

describe("selectionHasMismatch", () => {
  it("is false for a selection of one", () => {
    expect(selectionHasMismatch([t({ prompt: "x" })], "prompt")).toBe(false);
  });

  it("is false when every transition holds the same value", () => {
    expect(selectionHasMismatch([t(), t(), t()], "duration")).toBe(false);
  });

  it("is true when one transition differs", () => {
    expect(selectionHasMismatch([t(), t({ duration: 8 })], "duration")).toBe(
      true,
    );
  });

  it("compares each field independently", () => {
    const selection = [t({ prompt: "a" }), t({ prompt: "b" })];
    expect(selectionHasMismatch(selection, "prompt")).toBe(true);
    expect(selectionHasMismatch(selection, "model")).toBe(false);
  });

  it("compares LoRA by path, not by object identity", () => {
    const same = [
      t({ highNoiseLoras: LORA }),
      t({ highNoiseLoras: [...LORA] }),
    ];
    expect(selectionHasMismatch(same, "highNoiseLoras")).toBe(false);
  });
});

describe("mismatchedFields", () => {
  it("lists only the fields that actually disagree", () => {
    const selection = [
      t({ prompt: "a", duration: 5 }),
      t({ prompt: "b", duration: 5 }),
    ];
    expect(mismatchedFields(selection)).toEqual(["prompt"]);
  });

  it("is empty for an aligned selection", () => {
    expect(mismatchedFields([t(), t()])).toEqual([]);
  });

  it("reports both LoRA sets, which the picker always moves together", () => {
    const selection = [
      t({ highNoiseLoras: LORA, lowNoiseLoras: LORA }),
      t({ highNoiseLoras: [], lowNoiseLoras: [] }),
    ];
    expect(mismatchedFields(selection)).toEqual([
      "highNoiseLoras",
      "lowNoiseLoras",
    ]);
  });
});

describe("forcedFieldPatch", () => {
  it("writes the source's value for each clashing field", () => {
    const source = t({ prompt: "swirl", duration: 10 });
    expect(forcedFieldPatch(source, ["prompt", "duration"])).toEqual({
      prompt: "swirl",
      duration: 10,
    });
  });

  it("touches nothing outside the fields it is given", () => {
    const patch = forcedFieldPatch(t({ prompt: "swirl", model: "ltx-i2v" }), [
      "prompt",
    ]);
    expect(Object.keys(patch)).toEqual(["prompt"]);
  });

  it("leaves the selection agreeing about every field it forced", () => {
    const source = t({ prompt: "swirl", highNoiseLoras: LORA });
    const other = t({ prompt: "drift", duration: 8 });
    const clashes = mismatchedFields([source, other]);
    const aligned = {
      ...other,
      settings: { ...other.settings, ...forcedFieldPatch(source, clashes) },
    };
    expect(mismatchedFields([source, aligned])).toEqual([]);
  });
});
