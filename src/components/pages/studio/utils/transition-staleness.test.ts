import { describe, it, expect } from "vitest";
import type { FlowTransition, TransitionSettings } from "@/types/flow.types";
import { isTransitionStale, settingsMatch } from "./transition-staleness";
// Relative, not "@/": the alias does not resolve for value imports in tests.
import { DEFAULT_TRANSITION_SETTINGS } from "../constants/default-transition-settings";

/** A transition rendered from exactly the settings it currently holds. */
const rendered = (
  settings: Partial<TransitionSettings> = {},
): FlowTransition => {
  const merged = { ...DEFAULT_TRANSITION_SETTINGS, ...settings };
  return {
    fromFrameId: "a",
    toFrameId: "b",
    status: "processed",
    dreamUuid: "dream-1",
    settings: merged,
    history: [
      { dreamUuid: "dream-1", createdAt: 1, completed: true, settings: merged },
    ],
  };
};

/** Edit the live settings without touching the recorded take. */
const edited = (
  transition: FlowTransition,
  patch: Partial<TransitionSettings>,
): FlowTransition => ({
  ...transition,
  settings: { ...transition.settings, ...patch },
});

describe("settingsMatch", () => {
  it("compares LoRA by path, not object identity", () => {
    const lora = [{ path: "a.safetensors", scale: 1 }];
    expect(
      settingsMatch(
        { ...DEFAULT_TRANSITION_SETTINGS, highNoiseLoras: lora },
        { ...DEFAULT_TRANSITION_SETTINGS, highNoiseLoras: [...lora] },
      ),
    ).toBe(true);
  });

  it("notices a low-noise LoRA change on its own", () => {
    expect(
      settingsMatch(
        { ...DEFAULT_TRANSITION_SETTINGS, lowNoiseLoras: [] },
        {
          ...DEFAULT_TRANSITION_SETTINGS,
          lowNoiseLoras: [{ path: "b.safetensors", scale: 1 }],
        },
      ),
    ).toBe(false);
  });
});

describe("isTransitionStale", () => {
  it("is false for a transition rendered from its current settings", () => {
    expect(isTransitionStale(rendered())).toBe(false);
  });

  it("is true once a field is edited", () => {
    expect(isTransitionStale(edited(rendered(), { prompt: "swirl" }))).toBe(
      true,
    );
  });

  it("is unaffected by another transition's settings", () => {
    // The point of dropping inheritance: there is no shared value left that can
    // move underneath a rendered transition.
    const a = rendered({ prompt: "drift" });
    const b = edited(rendered({ prompt: "drift" }), { prompt: "swirl" });
    expect(isTransitionStale(a)).toBe(false);
    expect(isTransitionStale(b)).toBe(true);
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
          settings: { ...older.settings, prompt: "swirl" },
        },
      ],
    };
    expect(isTransitionStale(transition)).toBe(false);
  });

  it("is false for a take with no recorded settings", () => {
    expect(isTransitionStale({ ...rendered(), history: [] })).toBe(false);
  });

  it("is false for anything not rendered", () => {
    for (const status of ["idle", "queue", "processing", "failed"] as const) {
      const transition = edited({ ...rendered(), status }, { prompt: "swirl" });
      expect(isTransitionStale(transition)).toBe(false);
    }
  });

  it("notices a LoRA change", () => {
    const transition = rendered({
      highNoiseLoras: [{ path: "a.safetensors", scale: 1 }],
    });
    expect(
      isTransitionStale(
        edited(transition, {
          highNoiseLoras: [{ path: "b.safetensors", scale: 1 }],
        }),
      ),
    ).toBe(true);
  });

  it("does not fire on a random seed, which records as -1 either way", () => {
    expect(isTransitionStale(rendered({ seed: -1 }))).toBe(false);
  });
});
