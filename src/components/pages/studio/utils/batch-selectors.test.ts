import { describe, expect, it } from "vitest";
import type { StudioJob } from "../../../../types/studio.types";
import { findCellJob, isCellChecked, jobCompletion } from "./batch-selectors";

const job = (overrides: Partial<StudioJob> = {}): StudioJob => ({
  imageId: "img",
  actionId: "act",
  dreamUuid: "dream",
  jobType: "ltx-i2v",
  status: "processed",
  ...overrides,
});

describe("isCellChecked", () => {
  const none = new Set<string>();
  const picked = new Set(["img:act"]);

  it("checks an empty cell unless it was unchecked", () => {
    expect(isCellChecked(undefined, "img:act", none, none)).toBe(true);
    expect(isCellChecked(undefined, "img:act", picked, none)).toBe(false);
  });

  it("leaves a rendered or failed cell off unless picked to re-render", () => {
    for (const status of ["processed", "failed"] as const) {
      expect(isCellChecked(job({ status }), "img:act", none, none)).toBe(false);
      expect(isCellChecked(job({ status }), "img:act", none, picked)).toBe(
        true,
      );
    }
  });

  it("ignores an old exclusion once the cell has a clip", () => {
    expect(isCellChecked(job(), "img:act", picked, none)).toBe(false);
  });

  it("shows an in-flight cell as checked", () => {
    expect(
      isCellChecked(job({ status: "processing" }), "img:act", none, none),
    ).toBe(true);
  });
});

describe("findCellJob", () => {
  it("finds the cell's clip whatever model made it, but not an uprez", () => {
    const wan = job({ jobType: "wan-i2v" });
    expect(findCellJob([wan], "img", "act")).toBe(wan);
    expect(
      findCellJob([job({ jobType: "uprez" })], "img", "act"),
    ).toBeUndefined();
  });
});

describe("jobCompletion", () => {
  it("weights rendering by its percent and ingest after it", () => {
    expect(jobCompletion(job({ status: "queue" }))).toBe(0);
    expect(jobCompletion(job({ status: "processing", progress: 50 }))).toBe(
      0.45,
    );
    expect(
      jobCompletion(job({ status: "processing", ingesting: true })),
    ).toBeCloseTo(0.9);
    expect(jobCompletion(job({ status: "processed" }))).toBe(1);
    expect(jobCompletion(job({ status: "failed" }))).toBe(1);
  });
});
