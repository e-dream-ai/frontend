import { describe, it, expect, beforeEach, beforeAll } from "vitest";

// Polyfill localStorage for Node environment
beforeAll(() => {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
});

// Dynamic import after localStorage is set up
const { useStudioStore } = await import("./studio.store");

describe("studio.store", () => {
  beforeEach(() => {
    useStudioStore.getState().resetSession();
  });

  describe("isGenerating", () => {
    it("defaults to false", () => {
      expect(useStudioStore.getState().isGenerating).toBe(false);
    });

    it("can be set to true", () => {
      useStudioStore.getState().setIsGenerating(true);
      expect(useStudioStore.getState().isGenerating).toBe(true);
    });

    it("resets to false on resetSession", () => {
      useStudioStore.getState().setIsGenerating(true);
      useStudioStore.getState().resetSession();
      expect(useStudioStore.getState().isGenerating).toBe(false);
    });
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

    it("clears when switching to results tab", () => {
      useStudioStore.getState().incrementNewCompleted();
      useStudioStore.getState().incrementNewCompleted();
      useStudioStore.getState().setActiveTab("results");
      expect(useStudioStore.getState().newCompletedCount).toBe(0);
    });

    it("atomically sets activeTab and clears newCompletedCount", () => {
      useStudioStore.getState().incrementNewCompleted();
      useStudioStore.getState().incrementNewCompleted();

      // Subscribe and capture intermediate states
      const snapshots: Array<{ activeTab: string; count: number }> = [];
      const unsub = useStudioStore.subscribe((state) => {
        snapshots.push({
          activeTab: state.activeTab,
          count: state.newCompletedCount,
        });
      });

      useStudioStore.getState().setActiveTab("results");
      unsub();

      // Should be exactly ONE state update, not two
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0]).toEqual({ activeTab: "results", count: 0 });
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
        selectedForUprez: false,
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
        selectedForUprez: false,
      });

      useStudioStore.getState().updateJob("dream1", { status: "processed" });
      const job = useStudioStore.getState().jobs[0];
      expect(job.completedAt).toBeDefined();
    });
  });

  describe("excludedCombos", () => {
    it("toggles combo exclusion", () => {
      useStudioStore.getState().toggleComboExcluded("key1");
      expect(useStudioStore.getState().excludedCombos.has("key1")).toBe(true);

      useStudioStore.getState().toggleComboExcluded("key1");
      expect(useStudioStore.getState().excludedCombos.has("key1")).toBe(false);
    });
  });

  describe("partialize", () => {
    it("excludes previewFrame from persisted images", () => {
      useStudioStore.getState().addImage({
        uuid: "img1",
        url: "http://example.com/img.jpg",
        name: "Test",
        status: "processed",
        selected: false,
        previewFrame: "base64data",
      });

      // Access partialize through the persist API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const persist = (useStudioStore as any).persist;
      const options = persist?.getOptions?.();
      if (options?.partialize) {
        const partialized = options.partialize(useStudioStore.getState());
        expect(partialized.images[0].previewFrame).toBeUndefined();
      }
    });
  });
});
