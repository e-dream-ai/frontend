import { describe, it, expect } from "vitest";
import type { FlowTransition } from "@/types/flow.types";
import {
  effectiveFieldValue,
  fieldComparisonKey,
  forcedFieldPatch,
  mismatchedFields,
  selectionHasMismatch,
  type TransitionGlobals,
} from "./transition-field-values";
import { resolvePresetAction } from "./resolve-flow-settings";

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

describe("preset-derived values", () => {
  // With no prompt stored anywhere, the panel shows the effective preset's
  // prompt — so two transitions on different presets are showing different
  // prompts, and comparing the (identical, absent) overrides would miss it.
  const NO_PROMPT: TransitionGlobals = { ...GLOBALS, globalPrompt: "" };

  it("falls back to the preset's prompt when nothing is stored", () => {
    expect(
      effectiveFieldValue(
        t({ presetOverride: "Morph" }),
        NO_PROMPT,
        "promptOverride",
      ),
    ).toBe(resolvePresetAction("Morph")?.prompt);
  });

  it("prefers a stored prompt over the preset's", () => {
    expect(
      effectiveFieldValue(
        t({ presetOverride: "Morph", promptOverride: "swirl" }),
        NO_PROMPT,
        "promptOverride",
      ),
    ).toBe("swirl");
  });

  it("reports a prompt mismatch between two presets that carry different ones", () => {
    const selection = [
      t({ presetOverride: "Morph" }),
      t({ presetOverride: "Kaleidoscope" }),
    ];
    expect(selectionHasMismatch(selection, NO_PROMPT, "promptOverride")).toBe(
      true,
    );
    expect(mismatchedFields(selection, NO_PROMPT)).toEqual([
      "presetOverride",
      "promptOverride",
    ]);
  });

  it("falls back to the preset's LoRA when nothing is stored", () => {
    const preset = "Camera Basics";
    expect(
      effectiveFieldValue(
        t({ presetOverride: preset }),
        GLOBALS,
        "loraOverride",
      ),
    ).toEqual(resolvePresetAction(preset)?.highNoiseLoras);
  });

  it("reports a LoRA mismatch driven by the preset alone", () => {
    const selection = [t({ presetOverride: "Camera Basics" }), t()];
    expect(selectionHasMismatch(selection, GLOBALS, "loraOverride")).toBe(true);
  });
});

describe("forcedFieldPatch", () => {
  it("writes the source's effective value for each clashing field", () => {
    const source = t({ promptOverride: "swirl", durationOverride: 10 });
    expect(
      forcedFieldPatch(source, GLOBALS, ["promptOverride", "durationOverride"]),
    ).toEqual({ promptOverride: "swirl", durationOverride: 10 });
  });

  it("resolves a field the source only inherits", () => {
    expect(forcedFieldPatch(t(), GLOBALS, ["durationOverride"])).toEqual({
      durationOverride: GLOBALS.globalDuration,
    });
  });

  it("touches nothing outside the fields it is given", () => {
    const patch = forcedFieldPatch(
      t({ promptOverride: "swirl", modelOverride: "ltx-i2v" }),
      GLOBALS,
      ["promptOverride"],
    );
    expect(Object.keys(patch)).toEqual(["promptOverride"]);
  });

  it("leaves the selection agreeing about every field it forced", () => {
    const globals = { ...GLOBALS, globalPrompt: "" };
    const source = t({ presetOverride: "Morph" });
    const other = t({ presetOverride: "Kaleidoscope" });
    const clashes = mismatchedFields([source, other], globals);
    const aligned = { ...other, ...forcedFieldPatch(source, globals, clashes) };
    expect(mismatchedFields([source, aligned], globals)).toEqual([]);
  });
});
