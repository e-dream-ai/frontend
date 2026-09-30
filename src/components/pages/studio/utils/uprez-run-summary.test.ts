import { describe, it, expect } from "vitest";
import { formatUprezRunSummary, uprezRunHasWork } from "./uprez-run-summary";
import type { RunPlaylistResult } from "../../../../api/playlist/mutation/useRunPlaylist";

const result = (over: Partial<RunPlaylistResult> = {}): RunPlaylistResult => ({
  created: 0,
  requeued: 0,
  kept: 0,
  reused: 0,
  replaced: 0,
  cancelled: 0,
  removed: 0,
  skipped: 0,
  linked: 0,
  ...over,
});

describe("uprezRunHasWork", () => {
  it("is false when everything is kept or skipped", () => {
    expect(uprezRunHasWork(result({ kept: 5, skipped: 2 }))).toBe(false);
  });

  it("is true for any render, reuse, swap or removal", () => {
    expect(uprezRunHasWork(result({ created: 1 }))).toBe(true);
    expect(uprezRunHasWork(result({ requeued: 1 }))).toBe(true);
    expect(uprezRunHasWork(result({ reused: 1 }))).toBe(true);
    expect(uprezRunHasWork(result({ replaced: 1 }))).toBe(true);
    expect(uprezRunHasWork(result({ removed: 1 }))).toBe(true);
  });
});

describe("formatUprezRunSummary", () => {
  it("says so when there is nothing to do", () => {
    expect(formatUprezRunSummary(result({ kept: 3 }), true)).toBe(
      "Everything is up to date at these settings.",
    );
  });

  it("describes a settings change as a preview", () => {
    expect(
      formatUprezRunSummary(
        result({ created: 2, reused: 1, replaced: 3, cancelled: 1 }),
        true,
      ),
    ).toBe(
      "Running will render 2 dreams, reuse 1 earlier render, swap out 3 dreams at other settings (cancelling 1 in progress).",
    );
  });

  it("describes a started run", () => {
    expect(formatUprezRunSummary(result({ requeued: 1, removed: 2 }))).toBe(
      "Uprez run started: render 1 dream, remove 2 dreams no longer in the source.",
    );
  });
});
