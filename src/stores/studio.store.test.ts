import { describe, it, expect, beforeEach } from "vitest";
import { useStudioStore } from "./studio.store";

describe("studio.store", () => {
  beforeEach(() => {
    useStudioStore.getState().resetSession();
  });

  describe("newCompletedCount", () => {
    it("increments", () => {
      useStudioStore.getState().incrementNewCompleted();
      expect(useStudioStore.getState().newCompletedCount).toBe(1);
    });

    it("clears", () => {
      useStudioStore.getState().incrementNewCompleted();
      useStudioStore.getState().clearNewCompleted();
      expect(useStudioStore.getState().newCompletedCount).toBe(0);
    });

    it("clears when switching to the results matrix", () => {
      useStudioStore.getState().incrementNewCompleted();
      useStudioStore.getState().incrementNewCompleted();
      useStudioStore.getState().setActiveTab("generate");
      expect(useStudioStore.getState().newCompletedCount).toBe(0);
    });
  });

  describe("updateJob timestamps", () => {
    it("sets startedAt when status changes to processing", () => {
      useStudioStore.getState().addJob({
        imageId: "img1",
        actionId: "act1",
        dreamUuid: "dream1",
        jobType: "wan-i2v",
        status: "queue",
      });

      useStudioStore.getState().updateJob("dream1", { status: "processing" });
      const job = useStudioStore.getState().jobs[0];
      expect(job.startedAt).toBeDefined();
      expect(typeof job.startedAt).toBe("number");
    });

    it("sets completedAt when status changes to processed", () => {
      useStudioStore.getState().addJob({
        imageId: "img1",
        actionId: "act1",
        dreamUuid: "dream1",
        jobType: "wan-i2v",
        status: "processing",
      });

      useStudioStore.getState().updateJob("dream1", { status: "processed" });
      const job = useStudioStore.getState().jobs[0];
      expect(job.completedAt).toBeDefined();
    });
  });

  describe("clip history", () => {
    const clip = (dreamUuid: string, status = "processed" as const) => ({
      imageId: "img",
      actionId: "act",
      dreamUuid,
      jobType: "ltx-i2v" as const,
      status,
    });

    it("archives a rendered clip newest first, and drops a failed one", () => {
      const s = useStudioStore.getState();
      s.addJob(clip("a"));
      s.archiveJob("a");
      s.addJob(clip("b"));
      s.archiveJob("b");
      s.addJob({ ...clip("c"), status: "failed" });
      s.archiveJob("c");
      const state = useStudioStore.getState();
      expect(state.jobs).toEqual([]);
      expect(state.historyJobs.map((j) => j.dreamUuid)).toEqual(["b", "a"]);
    });

    it("restores into the cell and archives what it displaces", () => {
      const s = useStudioStore.getState();
      s.addJob(clip("old"));
      s.archiveJob("old");
      s.addJob(clip("new"));
      const result = useStudioStore.getState().restoreJob("old");
      expect(result?.displaced?.dreamUuid).toBe("new");
      const state = useStudioStore.getState();
      expect(state.jobs.map((j) => j.dreamUuid)).toEqual(["old"]);
      expect(state.historyJobs.map((j) => j.dreamUuid)).toEqual(["new"]);
    });

    it("brings a removed action back in place with its clip", () => {
      const s = useStudioStore.getState();
      s.addImage({ uuid: "img", url: "", name: "I", status: "processed" });
      s.addImage({ uuid: "img2", url: "", name: "J", status: "processed" });
      s.addAction({ id: "a1", prompt: "one" });
      s.addAction({ id: "act", prompt: "two" });
      s.addAction({ id: "a3", prompt: "three" });
      s.addJob(clip("x"));
      s.archiveJob("x");
      s.removeAction("act");
      expect(useStudioStore.getState().removedActions).toHaveLength(1);

      useStudioStore.getState().restoreJob("x");
      const state = useStudioStore.getState();
      expect(state.actions.map((a) => a.id)).toEqual(["a1", "act", "a3"]);
      expect(state.removedActions).toEqual([]);
      expect(state.jobs.map((j) => j.dreamUuid)).toEqual(["x"]);
      // The column's other cell comes back unchecked, not queued.
      expect(state.excludedCombos.has("img2:act")).toBe(true);
      expect(state.excludedCombos.has("img:act")).toBe(false);
    });

    it("brings a removed image back in place with its clip", () => {
      const s = useStudioStore.getState();
      s.addImage({ uuid: "img0", url: "", name: "H", status: "processed" });
      s.addImage({ uuid: "img", url: "", name: "I", status: "processed" });
      s.addAction({ id: "act", prompt: "two" });
      s.addAction({ id: "a2", prompt: "three" });
      s.addJob(clip("x"));
      s.archiveJob("x");
      s.removeImage("img");

      useStudioStore.getState().restoreJob("x");
      const state = useStudioStore.getState();
      expect(state.images.map((i) => i.uuid)).toEqual(["img0", "img"]);
      expect(state.removedImages).toEqual([]);
      expect(state.excludedCombos.has("img:a2")).toBe(true);
    });

    it("archives several clips in one update, newest first", () => {
      const s = useStudioStore.getState();
      s.addJob(clip("a"));
      s.addJob(clip("b"));
      s.addJob({ ...clip("c"), status: "processing" });
      let updates = 0;
      const unsubscribe = useStudioStore.subscribe(() => updates++);
      useStudioStore.getState().archiveJobs(["a", "b", "c"]);
      unsubscribe();
      const state = useStudioStore.getState();
      expect(updates).toBe(1);
      expect(state.jobs).toEqual([]);
      expect(state.historyJobs.map((j) => j.dreamUuid)).toEqual(["b", "a"]);
    });

    it("keeps history to the newest HISTORY_LIMIT clips", async () => {
      const { HISTORY_LIMIT } = await import("./studio.store");
      const s = useStudioStore.getState();
      const uuids = Array.from(
        { length: HISTORY_LIMIT + 5 },
        (_, i) => `clip-${i}`,
      );
      for (const uuid of uuids) s.addJob(clip(uuid));
      useStudioStore.getState().archiveJobs(uuids);
      const { historyJobs } = useStudioStore.getState();
      expect(historyJobs).toHaveLength(HISTORY_LIMIT);
      expect(historyJobs[0].dreamUuid).toBe(uuids[uuids.length - 1]);
    });

    it("forgets a removed image or action no history clip needs", () => {
      const s = useStudioStore.getState();
      s.addImage({ uuid: "img", url: "", name: "I", status: "processed" });
      s.addAction({ id: "act", prompt: "two" });
      s.removeImage("img");
      s.removeAction("act");
      const state = useStudioStore.getState();
      expect(state.removedImages).toEqual([]);
      expect(state.removedActions).toEqual([]);
    });

    it("will not restore over a cell that is still rendering", () => {
      const s = useStudioStore.getState();
      s.addJob(clip("old"));
      s.archiveJob("old");
      s.addJob({ ...clip("busy"), status: "processing" });
      expect(useStudioStore.getState().restoreJob("old")).toBeNull();
      expect(useStudioStore.getState().historyJobs).toHaveLength(1);
    });
  });

  describe("excludedCombos", () => {
    it("toggles combo exclusion", () => {
      useStudioStore.getState().toggleComboExcluded("key1");
      expect(useStudioStore.getState().excludedCombos.has("key1")).toBe(true);

      useStudioStore.getState().toggleComboExcluded("key1");
      expect(useStudioStore.getState().excludedCombos.has("key1")).toBe(false);
    });

    it("drops a removed action's combos and keeps the others", () => {
      const s = useStudioStore.getState();
      s.addAction({ id: "act1", prompt: "p" });
      s.setComboExcluded("img1:act1", true);
      s.setComboExcluded("img1:act2", true);
      s.toggleComboRerender("img2:act1");
      useStudioStore.getState().removeAction("act1");
      const state = useStudioStore.getState();
      expect([...state.excludedCombos]).toEqual(["img1:act2"]);
      expect(state.rerenderCombos.size).toBe(0);
    });
  });

  describe("imageGenParams", () => {
    it("partial update merges correctly", () => {
      useStudioStore.getState().setImageGenParams({ model: "z-image-turbo" });
      const params = useStudioStore.getState().imageGenParams;
      expect(params.model).toBe("z-image-turbo");
      expect(params.seedCount).toBe(8); // preserved from default
      expect(params.size).toBe("1280*720"); // preserved from default
    });
  });

  describe("videoGenParams", () => {
    it("partial update merges correctly", () => {
      useStudioStore.getState().setVideoGenParams({ model: "ltx-i2v" });
      const params = useStudioStore.getState().videoGenParams;
      expect(params.model).toBe("ltx-i2v");
      expect(params.duration).toBe(5); // preserved
      expect(params.numInferenceSteps).toBe(30); // preserved
    });

    it("carries a LoRA to the same camera move on the new model", () => {
      useStudioStore.getState().addAction({
        id: "a1",
        prompt: "dolly in",
        enabled: true,
        highNoiseLoras: [
          {
            path: "ltx-2-19b-lora-camera-control-dolly-in.safetensors",
            scale: 0.4,
          },
        ],
      });

      useStudioStore.getState().setVideoGenParams({ model: "wan-i2v" });

      const [action] = useStudioStore.getState().actions;
      expect(action.highNoiseLoras?.[0]?.path).toContain("zoom_in");
      expect(action.prompt).toBe("dolly in");
    });

    it("leaves LoRAs alone when the model does not change", () => {
      const loras = [
        {
          path: "ltx-2-19b-lora-camera-control-jib-up.safetensors",
          scale: 0.4,
        },
      ];
      useStudioStore.getState().addAction({
        id: "a1",
        prompt: "",
        enabled: true,
        highNoiseLoras: loras,
      });

      useStudioStore.getState().setVideoGenParams({ duration: 8 });

      expect(useStudioStore.getState().actions[0].highNoiseLoras).toEqual(
        loras,
      );
    });
  });
});
