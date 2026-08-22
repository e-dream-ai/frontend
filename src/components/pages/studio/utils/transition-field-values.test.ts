import { describe, it, expect } from "vitest";
import type { FlowTransition } from "@/types/flow.types";
import {
  effectiveFieldValue,
  fieldComparisonKey,
  mismatchedFields,
  selectionHasMismatch,
  type TransitionGlobals,
} from "./transition-field-values";

const GLOBALS: TransitionGlobals = {
  globalPresetId: "Abstract",
  globalPrompt: "drift",
  globalNegativePrompt: "",
  globalDuration: 5,
  globalModel: "kling-25-i2v",
  globalNumInferenceSteps: 30,
  globalGuidance: 0.5,
  globalSeed: -1,
  globalLora: undefined,
};

const t = (overrides: Partial<FlowTransition> = {}): FlowTransition => ({
  fromFrameId: "a",
  toFrameId: "b",
  status: "idle",
  ...overrides,
});

describe("effectiveFieldValue", () => {
  it("falls back to the global when there is no override", () => {
    expect(effectiveFieldValue(t(), GLOBALS, "promptOverride")).toBe("drift");
    expect(effectiveFieldValue(t(), GLOBALS, "durationOverride")).toBe(5);
  });

  it("prefers the override", () => {
    expect(
      effectiveFieldValue(
        t({ promptOverride: "swirl" }),
        GLOBALS,
        "promptOverride",
      ),
    ).toBe("swirl");
  });

  it("treats an empty-string override as a real value, not absence", () => {
    expect(
      effectiveFieldValue(
        t({ negativePromptOverride: "" }),
        { ...GLOBALS, globalNegativePrompt: "blurry" },
        "negativePromptOverride",
      ),
    ).toBe("");
  });
});

describe("fieldComparisonKey", () => {
  it("collapses LoRA arrays to their paths", () => {
    expect(fieldComparisonKey([{ path: "x.safetensors", scale: 1 }])).toBe(
      "x.safetensors",
    );
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
    expect(
      selectionHasMismatch(
        [t({ promptOverride: "x" })],
        GLOBALS,
        "promptOverride",
      ),
    ).toBe(false);
  });

  it("is false when every transition falls back to the same global", () => {
    expect(
      selectionHasMismatch([t(), t(), t()], GLOBALS, "durationOverride"),
    ).toBe(false);
  });

  it("is false when an override happens to equal the global", () => {
    expect(
      selectionHasMismatch(
        [t(), t({ durationOverride: 5 })],
        GLOBALS,
        "durationOverride",
      ),
    ).toBe(false);
  });

  it("is true when one transition overrides and the others do not", () => {
    expect(
      selectionHasMismatch(
        [t(), t({ durationOverride: 8 })],
        GLOBALS,
        "durationOverride",
      ),
    ).toBe(true);
  });

  it("compares each field independently", () => {
    const selection = [t({ promptOverride: "a" }), t({ promptOverride: "b" })];
    expect(selectionHasMismatch(selection, GLOBALS, "promptOverride")).toBe(
      true,
    );
    expect(selectionHasMismatch(selection, GLOBALS, "modelOverride")).toBe(
      false,
    );
  });
});

describe("mismatchedFields", () => {
  it("lists only the fields that actually disagree", () => {
    const selection = [
      t({ promptOverride: "a", durationOverride: 5 }),
      t({ promptOverride: "b", durationOverride: 5 }),
    ];
    expect(mismatchedFields(selection, GLOBALS)).toEqual(["promptOverride"]);
  });

  it("is empty for an aligned selection", () => {
    expect(mismatchedFields([t(), t()], GLOBALS)).toEqual([]);
  });
});
