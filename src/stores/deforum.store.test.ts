import { beforeEach, describe, expect, it } from "vitest";
import { useDeforumStore } from "./deforum.store";
import { resolveDeforumTargets } from "../components/pages/studio/utils/deforum-targets";

const store = () => useDeforumStore.getState();

beforeEach(() => store().resetDeforum());

describe("deforum store", () => {
  it("seeds a new clip from the selected one with its own seed and prompt rows", () => {
    store().addClip();
    const first = store().clips[0];
    store().setClipSettings([first.id], {
      prompts: [{ id: "p", frame: 0, text: "moths" }],
      maxFrames: 3000,
    });
    store().addClip();

    const [a, b] = store().clips;
    expect(b.settings.maxFrames).toBe(3000);
    expect(b.settings.prompts[0].text).toBe("moths");
    expect(b.settings.seed).not.toBe(a.settings.seed);
    expect(b.settings.prompts[0]).not.toBe(a.settings.prompts[0]);
    expect(store().selectedIds).toEqual([b.id]);
  });

  it("writes a prompt edit to every selected clip without sharing rows", () => {
    store().addClip();
    store().addClip();
    store().selectAllClips();
    const ids = store().selectedIds;
    store().setClipSettings(ids, {
      prompts: [{ id: "p", frame: 10, text: "same" }],
    });
    const [a, b] = store().clips;
    expect(a.settings.prompts).toEqual(b.settings.prompts);
    expect(a.settings.prompts[0]).not.toBe(b.settings.prompts[0]);
  });

  it("tracks test and final renders separately by dream uuid", () => {
    store().addClip();
    const clip = store().clips[0];
    store().recordRender(clip.id, "test", {
      dreamUuid: "t1",
      createdAt: 1,
      settings: clip.settings,
    });
    store().recordRender(clip.id, "final", {
      dreamUuid: "f1",
      createdAt: 2,
      settings: clip.settings,
    });
    store().updateRenderStatus("t1", "processed");
    store().updateRenderStatus("f1", "processing", 40);

    const after = store().clips[0];
    expect(after.test).toMatchObject({ status: "processed" });
    expect(after.final).toMatchObject({ status: "processing", progress: 40 });
  });
});

describe("resolveDeforumTargets", () => {
  it("covers only clips behind their settings when nothing is selected", () => {
    store().addClip();
    store().addClip();
    const [a, b] = store().clips;
    store().setClipSettings([a.id, b.id], {
      prompts: [{ id: "p", frame: 0, text: "x" }],
    });
    const done = store().clips[0];
    store().recordRender(done.id, "test", {
      dreamUuid: "t1",
      createdAt: 1,
      settings: done.settings,
      status: "processed",
    });

    const ids = (kind: "test" | "final") =>
      resolveDeforumTargets(store().clips, [], kind).map((c) => c.id);
    expect(ids("test")).toEqual([b.id]);
    expect(ids("final")).toEqual([a.id, b.id]);

    // Editing a rendered clip puts it behind again.
    store().setClipSettings([a.id], { steps: 30 });
    expect(ids("test")).toEqual([a.id, b.id]);
  });

  it("reruns an explicit selection but skips clips without a prompt", () => {
    store().addClip();
    store().addClip();
    const [a, b] = store().clips;
    store().setClipSettings([a.id], {
      prompts: [{ id: "p", frame: 0, text: "x" }],
    });
    expect(
      resolveDeforumTargets(store().clips, [a.id, b.id], "final").map(
        (c) => c.id,
      ),
    ).toEqual([a.id]);
  });
});
