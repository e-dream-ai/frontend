import { describe, it, expect } from "vitest";
import type { FlowTransition, VariationCandidate } from "@/types/flow.types";
import {
  isVideoUrl,
  aggregateVariationStatus,
  aggregateVariationProgress,
  effectiveTransitionStatus,
  shouldOpenVariationLightbox,
  transitionHasUsableResult,
} from "../variation-status";

const v = (
  status: VariationCandidate["status"],
  extra: Partial<VariationCandidate> = {},
): VariationCandidate => ({
  id: Math.random().toString(36).slice(2),
  method: "expansion",
  status,
  ...extra,
});

const tr = (t: Partial<FlowTransition>): FlowTransition => ({
  fromKeyframeId: "a",
  toKeyframeId: "b",
  status: "idle",
  ...t,
});

describe("isVideoUrl", () => {
  it("detects video extensions, including with query strings", () => {
    expect(isVideoUrl("https://x/y/clip_processed.mp4")).toBe(true);
    expect(isVideoUrl("https://x/y/clip.mp4?sig=abc123")).toBe(true);
    expect(isVideoUrl("https://x/y/clip.webm")).toBe(true);
  });
  it("returns false for images and empty input", () => {
    expect(isVideoUrl("https://x/y/thumb.jpg")).toBe(false);
    expect(isVideoUrl("https://x/y/thumb.png?sig=z")).toBe(false);
    expect(isVideoUrl(undefined)).toBe(false);
    expect(isVideoUrl("")).toBe(false);
  });
});

describe("aggregateVariationStatus", () => {
  it("is 'none' when there are no variations", () => {
    expect(aggregateVariationStatus(undefined)).toBe("none");
    expect(aggregateVariationStatus([])).toBe("none");
  });
  it("is 'processing' if any variation is processing", () => {
    expect(aggregateVariationStatus([v("processed"), v("processing")])).toBe(
      "processing",
    );
  });
  it("is 'queue' if any is queued and none processing", () => {
    expect(aggregateVariationStatus([v("processed"), v("queue")])).toBe(
      "queue",
    );
  });
  it("is 'ready' when at least one processed and none pending", () => {
    expect(aggregateVariationStatus([v("processed"), v("failed")])).toBe(
      "ready",
    );
    expect(aggregateVariationStatus([v("processed"), v("processed")])).toBe(
      "ready",
    );
  });
  it("is 'failed' when all failed", () => {
    expect(aggregateVariationStatus([v("failed"), v("failed")])).toBe("failed");
  });
});

describe("aggregateVariationProgress", () => {
  it("averages with processed counting as 100", () => {
    expect(
      aggregateVariationProgress([
        v("processed"),
        v("processing", { progress: 50 }),
      ]),
    ).toBe(75);
  });
  it("treats missing progress as 0", () => {
    expect(aggregateVariationProgress([v("queue"), v("processing")])).toBe(0);
  });
});

describe("effectiveTransitionStatus", () => {
  it("uses the transition's own status for the single-variant path", () => {
    expect(effectiveTransitionStatus(tr({ status: "processing" }))).toBe(
      "processing",
    );
    expect(effectiveTransitionStatus(tr({ status: "processed" }))).toBe(
      "processed",
    );
  });
  it("derives from variations when transition is idle but variations exist", () => {
    expect(
      effectiveTransitionStatus(
        tr({ status: "idle", variations: [v("processing"), v("queue")] }),
      ),
    ).toBe("processing");
    // all variations done, none selected yet -> reviewable
    expect(
      effectiveTransitionStatus(
        tr({ status: "idle", variations: [v("processed"), v("processed")] }),
      ),
    ).toBe("review");
  });
  it("stays idle when there are no variations", () => {
    expect(effectiveTransitionStatus(tr({ status: "idle" }))).toBe("idle");
  });
});

describe("shouldOpenVariationLightbox", () => {
  it("opens for a processed single result", () => {
    expect(shouldOpenVariationLightbox(tr({ status: "processed" }))).toBe(true);
  });
  it("opens whenever variations exist, regardless of transition status", () => {
    expect(
      shouldOpenVariationLightbox(
        tr({ status: "idle", variations: [v("processed"), v("processed")] }),
      ),
    ).toBe(true);
    expect(
      shouldOpenVariationLightbox(
        tr({ status: "idle", variations: [v("processing")] }),
      ),
    ).toBe(true);
  });
  it("does not open for a bare idle transition (opens settings instead)", () => {
    expect(shouldOpenVariationLightbox(tr({ status: "idle" }))).toBe(false);
  });
});

describe("transitionHasUsableResult", () => {
  it("true for a processed transition", () => {
    expect(transitionHasUsableResult(tr({ status: "processed" }))).toBe(true);
  });
  it("true when variations are ready to review", () => {
    expect(
      transitionHasUsableResult(
        tr({ status: "idle", variations: [v("processed")] }),
      ),
    ).toBe(true);
  });
  it("false while variations still generating", () => {
    expect(
      transitionHasUsableResult(
        tr({ status: "idle", variations: [v("processing")] }),
      ),
    ).toBe(false);
  });
  it("false for a bare idle transition", () => {
    expect(transitionHasUsableResult(tr({ status: "idle" }))).toBe(false);
  });
});
