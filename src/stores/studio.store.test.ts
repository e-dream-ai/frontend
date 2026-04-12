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

  describe("migration v2 → v3", () => {
    it("renames qwenParams to imageGenParams with default model", () => {
      const v2State = {
        qwenParams: { seedCount: 8, size: "1280*720" },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const migrate = (useStudioStore as any).persist?.getOptions?.()?.migrate;
      const migrated = migrate?.(v2State, 2) as Record<string, unknown>;
      expect(migrated.imageGenParams).toEqual({
        model: "z-image-turbo",
        seedCount: 8,
        size: "1280*720",
      });
      expect(migrated.qwenParams).toBeUndefined();
    });
  });

  describe("migration v3 → v4", () => {
    it("renames wanParams to videoGenParams with default model", () => {
      const v3State = {
        wanParams: { duration: 5, numInferenceSteps: 30, guidance: 5.0 },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const migrate = (useStudioStore as any).persist?.getOptions?.()?.migrate;
      const migrated = migrate(v3State, 3) as Record<string, unknown>;
      expect(migrated.videoGenParams).toEqual({
        model: "ltx-i2v",
        duration: 5,
        numInferenceSteps: 30,
        guidance: 5.0,
      });
      expect(migrated.wanParams).toBeUndefined();
    });
  });

  describe("selectAllJobsForUprez", () => {
    it("does not select nvidia-uprez jobs for uprezzing", () => {
      useStudioStore.getState().addJob({
        imageId: "img1",
        actionId: "act1",
        dreamUuid: "dream1",
        jobType: "wan-i2v",
        status: "processed",
        selectedForUprez: false,
      });
      useStudioStore.getState().addJob({
        imageId: "img1",
        actionId: "uprez-act1",
        dreamUuid: "dream2",
        jobType: "nvidia-uprez",
        status: "processed",
        selectedForUprez: false,
      });
      useStudioStore.getState().addJob({
        imageId: "img1",
        actionId: "uprez-act2",
        dreamUuid: "dream3",
        jobType: "uprez",
        status: "processed",
        selectedForUprez: false,
      });

      useStudioStore.getState().selectAllJobsForUprez();

      const jobs = useStudioStore.getState().jobs;
      // wan-i2v job should be selected
      expect(jobs[0].selectedForUprez).toBe(true);
      // nvidia-uprez job should NOT be selected
      expect(jobs[1].selectedForUprez).toBe(false);
      // uprez job should NOT be selected
      expect(jobs[2].selectedForUprez).toBe(false);
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
  });

  describe("uprezModel", () => {
    it("defaults to uprez", () => {
      expect(useStudioStore.getState().uprezModel).toBe("uprez");
    });

    it("can be set to nvidia-uprez", () => {
      useStudioStore.getState().setUprezModel("nvidia-uprez");
      expect(useStudioStore.getState().uprezModel).toBe("nvidia-uprez");
    });

    it("resets on resetSession", () => {
      useStudioStore.getState().setUprezModel("nvidia-uprez");
      useStudioStore.getState().resetSession();
      expect(useStudioStore.getState().uprezModel).toBe("uprez");
    });
  });

  describe("migration v2 → v3 (edge cases)", () => {
    it("supplies defaults when qwenParams has missing fields", () => {
      const v2State = {
        qwenParams: { seedCount: 4 }, // missing size
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const migrate = (useStudioStore as any).persist?.getOptions?.()?.migrate;
      const migrated = migrate?.(v2State, 2) as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params = migrated.imageGenParams as any;
      expect(params.model).toBe("z-image-turbo");
      expect(params.seedCount).toBe(4);
      expect(params.size).toBe("1280*720"); // from defaults
    });

    it("supplies defaults when qwenParams is absent", () => {
      const v2State = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const migrate = (useStudioStore as any).persist?.getOptions?.()?.migrate;
      const migrated = migrate?.(v2State, 2) as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params = migrated.imageGenParams as any;
      expect(params.model).toBe("z-image-turbo");
      expect(params.seedCount).toBe(8);
      expect(params.size).toBe("1280*720");
    });
  });

  describe("migration v3 → v4 (edge cases)", () => {
    it("supplies defaults when wanParams has missing fields", () => {
      const v3State = {
        wanParams: { duration: 8 }, // missing numInferenceSteps, guidance
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const migrate = (useStudioStore as any).persist?.getOptions?.()?.migrate;
      const migrated = migrate(v3State, 3) as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params = migrated.videoGenParams as any;
      expect(params.model).toBe("ltx-i2v");
      expect(params.duration).toBe(8);
      expect(params.numInferenceSteps).toBe(30); // from defaults
      expect(params.guidance).toBe(5.0); // from defaults
    });

    it("supplies defaults when wanParams is absent", () => {
      const v3State = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const migrate = (useStudioStore as any).persist?.getOptions?.()?.migrate;
      const migrated = migrate(v3State, 3) as Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params = migrated.videoGenParams as any;
      expect(params.model).toBe("ltx-i2v");
      expect(params.duration).toBe(5);
      expect(params.numInferenceSteps).toBe(30);
      expect(params.guidance).toBe(5.0);
    });
  });

  describe("migration v4 → v5", () => {
    it("moves untouched legacy defaults to z-image-turbo and ltx-i2v", () => {
      const v4State = {
        imageGenParams: {
          model: "qwen-image",
          seedCount: 8,
          size: "1280*720",
        },
        videoGenParams: {
          model: "wan-i2v",
          duration: 5,
          numInferenceSteps: 30,
          guidance: 5.0,
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const migrate = (useStudioStore as any).persist?.getOptions?.()?.migrate;
      const migrated = migrate(v4State, 4) as Record<string, unknown>;

      expect(migrated.imageGenParams).toEqual({
        model: "z-image-turbo",
        seedCount: 8,
        size: "1280*720",
      });
      expect(migrated.videoGenParams).toEqual({
        model: "ltx-i2v",
        duration: 5,
        numInferenceSteps: 30,
        guidance: 5.0,
      });
    });

    it("preserves non-default legacy selections", () => {
      const v4State = {
        imageGenParams: {
          model: "qwen-image",
          seedCount: 4,
          size: "1280*720",
        },
        videoGenParams: {
          model: "wan-i2v",
          duration: 10,
          numInferenceSteps: 30,
          guidance: 5.0,
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const migrate = (useStudioStore as any).persist?.getOptions?.()?.migrate;
      const migrated = migrate(v4State, 4) as Record<string, unknown>;

      expect(migrated.imageGenParams).toEqual(v4State.imageGenParams);
      expect(migrated.videoGenParams).toEqual(v4State.videoGenParams);
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
