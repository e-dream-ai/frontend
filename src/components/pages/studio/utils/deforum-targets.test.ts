import { describe, expect, it } from "vitest";
import type {
  DeforumClip,
  DeforumRender,
  DeforumRenderStatus,
} from "@/types/deforum.types";
import {
  deforumPlaylistDreams,
  latestRender,
  liveRender,
  pendingRender,
} from "./deforum-targets";

const render = (
  dreamUuid: string,
  status: DeforumRenderStatus,
  createdAt: number,
): DeforumRender =>
  ({ dreamUuid, status, createdAt }) as unknown as DeforumRender;

const clip = (
  id: string,
  test?: DeforumRender,
  final?: DeforumRender,
): DeforumClip => ({ id, test, final }) as unknown as DeforumClip;

describe("latestRender / pendingRender", () => {
  it("picks the newest render in the state asked for, with its kind", () => {
    const c = clip(
      "a",
      render("t", "processed", 2),
      render("f", "processed", 1),
    );
    expect(latestRender(c)).toMatchObject({ kind: "test" });
    expect(pendingRender(c)).toBeUndefined();
  });

  it("prefers the final on a tie", () => {
    const c = clip("a", render("t", "queue", 1), render("f", "processing", 1));
    expect(pendingRender(c)).toMatchObject({ kind: "final" });
  });
});

describe("liveRender", () => {
  const idle = clip("idle", render("i", "processed", 9));
  const older = clip("older", render("o", "processing", 1));
  const newer = clip("newer", undefined, render("n", "queue", 2));

  it("follows the primary clip while it renders", () => {
    expect(liveRender([idle, older, newer], "older")).toMatchObject({
      clip: older,
      kind: "test",
    });
  });

  it("falls back to the most recently started render", () => {
    expect(liveRender([idle, older, newer], "idle")).toMatchObject({
      clip: newer,
      kind: "final",
    });
    expect(liveRender([idle, older, newer], undefined)?.clip).toBe(newer);
  });

  it("is undefined with nothing rendering", () => {
    expect(liveRender([idle], undefined)).toBeUndefined();
  });
});

describe("deforumPlaylistDreams", () => {
  it("lists each finished final once, in clip order", () => {
    expect(
      deforumPlaylistDreams([
        clip("a", undefined, render("f1", "processed", 1)),
        clip("b", render("t", "processed", 1)),
        clip("c", undefined, render("f2", "processing", 1)),
        clip("d", undefined, render("f1", "processed", 1)),
      ]),
    ).toEqual(["f1"]);
  });
});
