import { describe, it, expect } from "vitest";
import { findTransitionIndexByDream } from "./flow-progress.util";
import type { FlowTransition } from "@/types/flow.types";

const t = (over: Partial<FlowTransition>): FlowTransition => ({
  fromFrameId: "a",
  toFrameId: "b",
  status: "queue",
  ...over,
});

describe("findTransitionIndexByDream", () => {
  it("finds a transition by its video dream uuid", () => {
    const transitions = [t({ dreamUuid: "v1" }), t({ dreamUuid: "v2" })];
    expect(findTransitionIndexByDream(transitions, "v2", false)).toBe(1);
  });

  it("finds a transition by its uprez dream uuid", () => {
    const transitions = [
      t({ dreamUuid: "v1", uprezDreamUuid: "u1" }),
      t({ dreamUuid: "v2", uprezDreamUuid: "u2" }),
    ];
    expect(findTransitionIndexByDream(transitions, "u1", true)).toBe(0);
  });

  it("returns -1 when no transition owns the uuid", () => {
    const transitions = [t({ dreamUuid: "v1" })];
    expect(findTransitionIndexByDream(transitions, "missing", false)).toBe(-1);
  });

  it("resolves the correct edge after a reorder shifts positions", () => {
    // A pending edge that was at index 0 is now at index 2 after an insert.
    // Routing by uuid still lands on the right edge; routing by the old index
    // (0) would have hit the wrong one.
    const reordered = [
      t({ dreamUuid: "new-a" }),
      t({ dreamUuid: "new-b" }),
      t({ dreamUuid: "v-pending" }),
    ];
    expect(findTransitionIndexByDream(reordered, "v-pending", false)).toBe(2);
  });
});
