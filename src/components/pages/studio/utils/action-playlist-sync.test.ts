import { describe, expect, it } from "vitest";
import type {
  StudioAction,
  StudioImage,
  StudioJob,
} from "../../../../types/studio.types";
import type { PlaylistItem } from "../../../../types/playlist.types";
import type { Dream } from "../../../../types/dream.types";
import {
  matrixDreamUuids,
  planPlaylistChanges,
  planPlaylistOrder,
  studioDreamUuids,
} from "./action-playlist-sync";

const image = (uuid: string, status: StudioImage["status"] = "processed") =>
  ({ uuid, url: "", name: uuid, status }) as StudioImage;

const action = (id: string, prompt = id) => ({ id, prompt }) as StudioAction;

const job = (
  imageId: string,
  actionId: string,
  dreamUuid: string,
  overrides: Partial<StudioJob> = {},
): StudioJob => ({
  imageId,
  actionId,
  dreamUuid,
  jobType: "ltx-i2v",
  status: "processed",
  ...overrides,
});

const item = (id: number, uuid: string, order: number) =>
  ({
    id,
    type: "dream",
    order,
    dreamItem: { uuid } as Dream,
  }) as PlaylistItem;

describe("matrixDreamUuids", () => {
  it("lists rendered clips row by row in column order, whatever order they were made in", () => {
    const jobs = [
      job("i2", "a1", "d21"),
      job("i1", "a2", "d12"),
      job("i1", "a1", "d11"),
      job("i2", "a2", "d22"),
    ];
    expect(
      matrixDreamUuids(
        [image("i1"), image("i2")],
        [action("a1"), action("a2")],
        jobs,
      ),
    ).toEqual(["d11", "d12", "d21", "d22"]);
  });

  it("skips clips still rendering or failed, and cells outside the matrix", () => {
    const jobs = [
      job("i1", "a1", "queued", { status: "queue" }),
      job("i1", "a2", "failed", { status: "failed" }),
      job("i1", "blank", "blank-col"),
      job("pending", "a1", "pending-row"),
      job("i1", "a3", "up", { jobType: "uprez" }),
      job("i1", "a3", "d13"),
    ];
    expect(
      matrixDreamUuids(
        [image("i1"), image("pending", "processing")],
        [action("a1"), action("a2"), action("blank", " "), action("a3")],
        jobs,
      ),
    ).toEqual(["d13"]);
  });
});

describe("studioDreamUuids", () => {
  it("lists rendered matrix clips from jobs and history, not uprez or unfinished ones", () => {
    expect(
      studioDreamUuids(
        [
          job("i1", "a1", "done"),
          job("i1", "a2", "queued", { status: "queue" }),
          job("i1", "a3", "up", { jobType: "uprez" }),
        ],
        [
          job("i2", "a1", "archived"),
          job("i2", "a2", "old-up", { jobType: "uprez" }),
        ],
      ),
    ).toEqual(["done", "archived"]);
  });
});

describe("planPlaylistChanges", () => {
  it("adds missing clips and removes studio clips the matrix no longer shows", () => {
    const items = [
      item(1, "kept", 0),
      item(2, "replaced", 1),
      item(3, "mine", 2),
    ];
    const plan = planPlaylistChanges(
      items,
      ["kept", "new"],
      new Set(["kept", "replaced", "new"]),
    );
    expect(plan.add).toEqual(["new"]);
    expect(plan.remove.map((it) => it.id)).toEqual([2]);
  });
});

describe("planPlaylistOrder", () => {
  it("moves a re-render back to its matrix place", () => {
    // d12 was re-rendered and appended at the end.
    const items = [item(1, "d11", 0), item(3, "d21", 2), item(9, "d12", 5)];
    expect(planPlaylistOrder(items, ["d11", "d12", "d21"])).toEqual([
      { id: 9, order: 2 },
      { id: 3, order: 5 },
    ]);
  });

  it("keeps the slots of items the studio did not make", () => {
    const items = [item(1, "d2", 0), item(2, "other", 1), item(3, "d1", 2)];
    expect(planPlaylistOrder(items, ["d1", "d2"])).toEqual([
      { id: 3, order: 0 },
      { id: 1, order: 2 },
    ]);
  });

  it("does nothing when already in order", () => {
    const items = [item(1, "d1", 0), item(2, "d2", 1)];
    expect(planPlaylistOrder(items, ["d1", "d2"])).toBeNull();
  });
});
