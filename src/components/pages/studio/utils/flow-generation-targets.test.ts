import { describe, it, expect } from "vitest";
import type {
  FlowReferenceFrame,
  FlowTransition,
  TransitionStatus,
} from "@/types/flow.types";
import type { TransitionGlobals } from "./transition-field-values";
import {
  resolveGenerationTargets,
  resolveSelectedTargets,
} from "./flow-generation-targets";
import { currentRunSettings } from "./transition-staleness";

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

const frame = (id: string): FlowReferenceFrame => ({
  id,
  name: id,
  imageUrl: `${id}.png`,
  naturalWidth: 1024,
  naturalHeight: 1024,
});

const FRAMES = [frame("a"), frame("b")];

const at = (status: TransitionStatus): FlowTransition => ({
  fromFrameId: "a",
  toFrameId: "b",
  status,
});

/** Rendered from exactly the settings it currently resolves to. */
const current = (overrides: Partial<FlowTransition> = {}): FlowTransition => {
  const base: FlowTransition = {
    ...at("processed"),
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
        settings: currentRunSettings(base, GLOBALS),
      },
    ],
  };
};

const indexes = (result: { targets: Array<{ index: number }> }) =>
  result.targets.map((t) => t.index);

describe("resolveGenerationTargets", () => {
  it("takes the never-rendered ones", () => {
    const result = resolveGenerationTargets(
      [at("idle"), at("failed")],
      FRAMES,
      GLOBALS,
    );
    expect(indexes(result)).toEqual([0, 1]);
    expect(result.neverRendered).toBe(2);
    expect(result.stale).toBe(0);
  });

  it("skips a rendered transition that still matches its settings", () => {
    const result = resolveGenerationTargets([current()], FRAMES, GLOBALS);
    expect(indexes(result)).toEqual([]);
  });

  // The bug this all exists for: edit a rendered transition and Generate used
  // to skip it, because "processed" was read as "done".
  it("takes a rendered transition that has been edited since", () => {
    const edited = { ...current(), promptOverride: "swirl" };
    const result = resolveGenerationTargets([edited], FRAMES, GLOBALS);
    expect(indexes(result)).toEqual([0]);
    expect(result.stale).toBe(1);
    expect(result.neverRendered).toBe(0);
  });

  it("takes one made stale by a global moving under it", () => {
    const result = resolveGenerationTargets([current()], FRAMES, {
      ...GLOBALS,
      globalPrompt: "swirl",
    });
    expect(indexes(result)).toEqual([0]);
    expect(result.stale).toBe(1);
  });

  it("leaves in-flight work alone", () => {
    const result = resolveGenerationTargets(
      [at("queue"), at("processing")],
      FRAMES,
      GLOBALS,
    );
    expect(indexes(result)).toEqual([]);
  });

  it("counts out mismatched aspect ratios instead of running them", () => {
    const frames = [
      frame("a"),
      { ...frame("b"), naturalWidth: 1920, naturalHeight: 1080 },
    ];
    const result = resolveGenerationTargets([at("idle")], frames, GLOBALS);
    expect(indexes(result)).toEqual([]);
    expect(result.skippedForMismatch).toBe(1);
  });
});

describe("resolveSelectedTargets", () => {
  it("takes everything picked, rendered and unedited included", () => {
    const result = resolveSelectedTargets(
      [0, 1],
      [current(), at("idle")],
      FRAMES,
    );
    expect(indexes(result)).toEqual([0, 1]);
  });

  it("keeps the caller's order and ignores indices that do not exist", () => {
    const result = resolveSelectedTargets(
      [1, 0, 9],
      [at("idle"), at("idle")],
      FRAMES,
    );
    expect(indexes(result)).toEqual([1, 0]);
  });

  it("still counts out mismatched aspect ratios", () => {
    const frames = [
      frame("a"),
      { ...frame("b"), naturalWidth: 1920, naturalHeight: 1080 },
    ];
    const result = resolveSelectedTargets([0], [current()], frames);
    expect(indexes(result)).toEqual([]);
    expect(result.skippedForMismatch).toBe(1);
  });
});
