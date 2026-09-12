import { describe, it, expect } from "vitest";
import type { FlowTransition } from "@/types/flow.types";
import type { TransitionGlobals } from "./transition-field-values";
import { currentRunSettings, isTransitionStale } from "./transition-staleness";

const GLOBALS: TransitionGlobals = {
  globalPresetId: "",
  globalPrompt: "drift",
  globalNegativePrompt: "",
  globalDuration: 5,
  globalModel: "kling-25-i2v",
  globalNumInferenceSteps: 30,
  globalGuidance: 0.5,
  globalSeed: -1,
  globalLora: undefined,
};

/** A transition rendered from exactly the settings it currently resolves to. */
const rendered = (
  overrides: Partial<FlowTransition> = {},
  globals: TransitionGlobals = GLOBALS,
): FlowTransition => {
  const base: FlowTransition = {
    fromFrameId: "a",
    toFrameId: "b",
    status: "processed",
    dreamUuid: "dream-1",
    ...overrides,
  };
  return {
    ...base,
    history: [
      {
        dreamUuid: "dream-1",
        createdAt: 1,
        completed: true,
        settings: currentRunSettings(base, globals),
      },
    ],
  };
};

describe("isTransitionStale", () => {
  it("is false for a transition rendered from its current settings", () => {
    expect(isTransitionStale(rendered(), GLOBALS)).toBe(false);
  });

  it("is true once an override is edited", () => {
    const transition = rendered();
    expect(
      isTransitionStale({ ...transition, promptOverride: "swirl" }, GLOBALS),
    ).toBe(true);
  });

  it("is true when a global moves under a transition with no override", () => {
    expect(
      isTransitionStale(rendered(), { ...GLOBALS, globalPrompt: "swirl" }),
    ).toBe(true);
  });

  it("ignores a global the transition overrides", () => {
    const transition = rendered({ promptOverride: "swirl" });
    expect(
      isTransitionStale(transition, { ...GLOBALS, globalPrompt: "other" }),
    ).toBe(false);
  });

  it("compares against the take in the flow, not the newest one", () => {
    // An older take restored: dreamUuid points back at it, and its settings are
    // what the panel now shows, so the transition is current.
    const older = rendered();
    const transition: FlowTransition = {
      ...older,
      history: [
        ...(older.history ?? []),
        {
          dreamUuid: "dream-2",
          createdAt: 2,
          completed: true,
          settings: currentRunSettings(
            { ...older, promptOverride: "swirl" },
            GLOBALS,
          ),
        },
      ],
    };
    expect(isTransitionStale(transition, GLOBALS)).toBe(false);
  });

  it("is false for a take with no recorded settings", () => {
    const transition = rendered();
    expect(isTransitionStale({ ...transition, history: [] }, GLOBALS)).toBe(
      false,
    );
  });

  it("is false for anything not rendered", () => {
    for (const status of ["idle", "queue", "processing", "failed"] as const) {
      const transition = { ...rendered({ promptOverride: "swirl" }), status };
      expect(isTransitionStale(transition, GLOBALS)).toBe(false);
    }
  });

  it("notices a LoRA change", () => {
    const transition = rendered({
      loraOverride: [{ path: "a.safetensors", scale: 1 }],
    });
    expect(
      isTransitionStale(
        { ...transition, loraOverride: [{ path: "b.safetensors", scale: 1 }] },
        GLOBALS,
      ),
    ).toBe(true);
  });

  it("does not fire on a random seed, which records as -1 either way", () => {
    expect(isTransitionStale(rendered({ seedOverride: -1 }), GLOBALS)).toBe(
      false,
    );
  });
});
