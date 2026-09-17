import { describe, it, expect } from "vitest";
import type {
  FlowReferenceFrame,
  FlowTransition,
  TransitionStatus,
} from "@/types/flow.types";
import {
  resolveGenerationTargets,
  resolveSelectedTargets,
} from "./flow-generation-targets";
// Relative, not "@/": the alias does not resolve for value imports in tests.
import { DEFAULT_TRANSITION_SETTINGS } from "../constants/default-transition-settings";

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
  settings: { ...DEFAULT_TRANSITION_SETTINGS },
});

/** Rendered from exactly the settings it currently holds. */
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
        settings: { ...base.settings },
      },
    ],
  };
};

const indexes = (result: { targets: Array<{ index: number }> }) =>
  result.targets.map((t) => t.index);

describe("resolveGenerationTargets", () => {
  it("takes the never-rendered ones", () => {
    const result = resolveGenerationTargets([at("idle"), at("failed")], FRAMES);
    expect(indexes(result)).toEqual([0, 1]);
    expect(result.neverRendered).toBe(2);
    expect(result.stale).toBe(0);
  });

  it("skips a rendered transition that still matches its settings", () => {
    const result = resolveGenerationTargets([current()], FRAMES);
    expect(indexes(result)).toEqual([]);
  });

  // The bug this all exists for: edit a rendered transition and Generate used
  // to skip it, because "processed" was read as "done".
  it("takes a rendered transition that has been edited since", () => {
    const base = current();
    const edited = {
      ...base,
      settings: { ...base.settings, prompt: "swirl" },
    };
    const result = resolveGenerationTargets([edited], FRAMES);
    expect(indexes(result)).toEqual([0]);
    expect(result.stale).toBe(1);
    expect(result.neverRendered).toBe(0);
  });

  // There is no longer any shared value that can move under a rendered
  // transition — editing one is the only way to make it stale.
  it("leaves a rendered transition alone when another is edited", () => {
    const result = resolveGenerationTargets(
      [
        current(),
        { ...current(), settings: { ...current().settings, prompt: "swirl" } },
      ],
      FRAMES,
    );
    expect(indexes(result)).toEqual([1]);
    expect(result.stale).toBe(1);
  });

  it("leaves in-flight work alone", () => {
    const result = resolveGenerationTargets(
      [at("queue"), at("processing")],
      FRAMES,
    );
    expect(indexes(result)).toEqual([]);
  });

  it("counts out mismatched aspect ratios instead of running them", () => {
    const frames = [
      frame("a"),
      { ...frame("b"), naturalWidth: 1920, naturalHeight: 1080 },
    ];
    const result = resolveGenerationTargets([at("idle")], frames);
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
