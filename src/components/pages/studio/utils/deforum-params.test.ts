import { describe, expect, it } from "vitest";
import type { DeforumSettings } from "@/types/deforum.types";
import { DEFAULT_DEFORUM_SETTINGS } from "../constants/deforum-options";
import {
  buildDeforumAlgoParams,
  promptMap,
  scaleFrame,
  scaleSchedule,
} from "./deforum-params";

const settings = (patch: Partial<DeforumSettings> = {}): DeforumSettings => ({
  ...DEFAULT_DEFORUM_SETTINGS,
  seed: 42,
  prompts: [
    { id: "a", frame: 0, text: "mantis priest" },
    { id: "b", frame: 150, text: "cathedral of moths" },
    { id: "c", frame: 299, text: "dawn" },
  ],
  maxFrames: 300,
  ...patch,
});

describe("scaleFrame", () => {
  it("pins both ends of the timeline", () => {
    expect(scaleFrame(0, 3000, 50)).toBe(0);
    expect(scaleFrame(2999, 3000, 50)).toBe(49);
  });

  it("scales the middle by one factor", () => {
    expect(scaleFrame(1500, 3001, 51)).toBe(25);
  });
});

describe("promptMap", () => {
  it("keeps full-length frames for a final render", () => {
    expect(promptMap(settings())).toEqual({
      "0": "mantis priest",
      "150": "cathedral of moths",
      "299": "dawn",
    });
  });

  it("squeezes prompt frames for a test render", () => {
    expect(promptMap(settings(), 50)).toEqual({
      "0": "mantis priest",
      "25": "cathedral of moths",
      "49": "dawn",
    });
  });

  it("sorts by frame and drops blank prompts", () => {
    const map = promptMap(
      settings({
        prompts: [
          { id: "b", frame: 100, text: "later" },
          { id: "x", frame: 50, text: "   " },
          { id: "a", frame: 0, text: "first" },
        ],
      }),
    );
    expect(Object.entries(map)).toEqual([
      ["0", "first"],
      ["100", "later"],
    ]);
  });

  it("nudges prompts that collide after scaling instead of dropping one", () => {
    const map = promptMap(
      settings({
        maxFrames: 3000,
        prompts: [
          { id: "a", frame: 0, text: "one" },
          { id: "b", frame: 5, text: "two" },
        ],
      }),
      50,
    );
    expect(map).toEqual({ "0": "one", "1": "two" });
  });
});

describe("scaleSchedule", () => {
  it("scales integer keys and keeps values verbatim", () => {
    expect(scaleSchedule("0:(1.0), 200:(1.8), 299: (2.3)", 300, 50)).toBe(
      "0: (1.0), 33: (1.8), 49: (2.3)",
    );
  });

  it("does not split inside a function call", () => {
    expect(scaleSchedule("0: (0.25*sin(4, t))", 300, 50)).toBe(
      "0: (0.25*sin(4, t))",
    );
  });

  it("leaves quoted expression keys alone", () => {
    expect(scaleSchedule('0:(s), 150:(-1), "max_f-2":(-1)', 300, 50)).toBe(
      '0: (s), 25: (-1), "max_f-2":(-1)',
    );
  });
});

describe("buildDeforumAlgoParams", () => {
  it("sends the full timeline for a final render", () => {
    const params = buildDeforumAlgoParams(
      settings({ zoom: "0: (1.0), 150: (1.05)" }),
      "final",
    );
    expect(params).toMatchObject({
      infinidream_algorithm: "deforum",
      max_frames: 300,
      seed: 42,
      sampler_name: "euler_ancestral",
      zoom: "0: (1.0), 150: (1.05)",
      prompts: { "0": "mantis priest", "150": "cathedral of moths" },
    });
  });

  it("scales frames, prompts and schedules together for a test", () => {
    const params = buildDeforumAlgoParams(
      settings({ zoom: "0: (1.0), 150: (1.05)" }),
      "test",
    );
    expect(params).toMatchObject({
      max_frames: 50,
      seed: 42,
      zoom: "0: (1.0), 25: (1.05)",
      prompts: {
        "0": "mantis priest",
        "25": "cathedral of moths",
        "49": "dawn",
      },
    });
  });

  it("does not stretch a timeline already shorter than a test", () => {
    const params = buildDeforumAlgoParams(
      settings({
        maxFrames: 30,
        prompts: [{ id: "a", frame: 10, text: "x" }],
      }),
      "test",
    );
    expect(params).toMatchObject({ max_frames: 30, prompts: { "10": "x" } });
  });
});
