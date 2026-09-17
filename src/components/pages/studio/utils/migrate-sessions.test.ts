import { describe, it, expect } from "vitest";
import { planSessionMigration } from "./migrate-sessions";

describe("planSessionMigration", () => {
  it("makes one project per session when only one editor was used", () => {
    const plan = planSessionMigration([
      { name: "Session 1", mode: "flow", flowState: { loop: true } },
    ]);

    expect(plan).toHaveLength(1);
    expect(plan[0].editorId).toBe("flow");
    expect(plan[0].name).toBe("Session 1");
  });

  it("fans a session out and suffixes when more than one editor has content", () => {
    const plan = planSessionMigration([
      {
        name: "Mixed",
        flowState: { loop: true },
        actionState: { images: [{ uuid: "i1" }] },
      },
    ]);

    expect(plan.map((p) => p.name)).toEqual(["Mixed (flow)", "Mixed (action)"]);
  });

  it("carries pre-#729 batchState across as action state", () => {
    const plan = planSessionMigration([
      { name: "Old", batchState: { images: [{ uuid: "i1" }] } },
    ]);

    expect(plan).toHaveLength(1);
    expect(plan[0].editorId).toBe("action");
  });

  it("skips empty blobs so untouched editors do not become projects", () => {
    const plan = planSessionMigration([
      {
        name: "Sparse",
        flowState: {},
        actionState: {},
        uprezState: { sourcePlaylist: { uuid: "p1" } },
      },
    ]);

    expect(plan).toHaveLength(1);
    expect(plan[0].editorId).toBe("uprez");
    expect(plan[0].name).toBe("Sparse");
  });

  it("strips expiring urls from migrated flow state", () => {
    const plan = planSessionMigration([
      {
        name: "WithImages",
        flowState: {
          referenceFrames: [
            {
              id: "a",
              dreamUuid: "d1",
              imageUrl: "https://expires",
              name: "a",
            },
          ],
          transitions: [],
        },
      },
    ]);

    const frames = (
      plan[0].state as { referenceFrames: Array<Record<string, unknown>> }
    ).referenceFrames;
    expect(frames[0]).not.toHaveProperty("imageUrl");
    expect(frames[0].dreamUuid).toBe("d1");
  });

  it("names unnamed sessions by position", () => {
    const plan = planSessionMigration([{ flowState: { loop: true } }]);
    expect(plan[0].name).toBe("Session 1");
  });

  it("returns nothing for no sessions", () => {
    expect(planSessionMigration([])).toEqual([]);
  });
});
