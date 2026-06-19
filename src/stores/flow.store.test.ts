import { describe, it, expect, beforeEach, beforeAll } from "vitest";

// Polyfill localStorage for Node environment (must run before store import)
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

// Dynamic import after localStorage is set up (persist middleware needs it)
const { useFlowStore } = await import("./flow.store");

// Reset store between tests
beforeEach(() => {
  useFlowStore.getState().resetFlow();
});

describe("flow store", () => {
  describe("keyframes", () => {
    it("starts with empty keyframes", () => {
      expect(useFlowStore.getState().keyframes).toEqual([]);
    });

    it("adds a keyframe", () => {
      useFlowStore.getState().addKeyframe({
        id: "kf-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/img.jpg",
        name: "nebula",
      });
      expect(useFlowStore.getState().keyframes).toHaveLength(1);
      expect(useFlowStore.getState().keyframes[0].name).toBe("nebula");
    });

    it("removes a keyframe by id", () => {
      const store = useFlowStore.getState();
      store.addKeyframe({
        id: "kf-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "nebula",
      });
      store.addKeyframe({
        id: "kf-2",
        keyframeUuid: "uuid-2",
        imageUrl: "https://example.com/2.jpg",
        name: "crystal",
      });
      useFlowStore.getState().removeKeyframe("kf-1");
      const kfs = useFlowStore.getState().keyframes;
      expect(kfs).toHaveLength(1);
      expect(kfs[0].id).toBe("kf-2");
    });

    it("removes loop keyframes when filtering (loop keyframes are derived)", () => {
      const store = useFlowStore.getState();
      store.addKeyframe({
        id: "kf-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "nebula",
        isLoopKeyframe: true,
      });
      useFlowStore.getState().removeKeyframe("kf-1");
      expect(useFlowStore.getState().keyframes).toHaveLength(0);
    });

    it("reorders keyframes", () => {
      const store = useFlowStore.getState();
      store.addKeyframe({
        id: "kf-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "first",
      });
      store.addKeyframe({
        id: "kf-2",
        keyframeUuid: "uuid-2",
        imageUrl: "https://example.com/2.jpg",
        name: "second",
      });
      store.addKeyframe({
        id: "kf-3",
        keyframeUuid: "uuid-3",
        imageUrl: "https://example.com/3.jpg",
        name: "third",
      });
      useFlowStore.getState().reorderKeyframes(["kf-3", "kf-1", "kf-2"]);
      const ids = useFlowStore.getState().keyframes.map((k) => k.id);
      expect(ids).toEqual(["kf-3", "kf-1", "kf-2"]);
    });
  });

  describe("loop", () => {
    it("starts with loop disabled", () => {
      expect(useFlowStore.getState().loop).toBe(false);
    });
    it("toggles loop", () => {
      useFlowStore.getState().setLoop(true);
      expect(useFlowStore.getState().loop).toBe(true);
    });
  });

  describe("derived: keyframesWithLoop", () => {
    it("returns keyframes as-is when loop is off", () => {
      const store = useFlowStore.getState();
      store.addKeyframe({
        id: "kf-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "nebula",
      });
      store.addKeyframe({
        id: "kf-2",
        keyframeUuid: "uuid-2",
        imageUrl: "https://example.com/2.jpg",
        name: "crystal",
      });
      const result = useFlowStore.getState().keyframesWithLoop();
      expect(result).toHaveLength(2);
      expect(result.every((k) => !k.isLoopKeyframe)).toBe(true);
    });

    it("appends loop keyframe mirroring first when loop is on", () => {
      const store = useFlowStore.getState();
      store.addKeyframe({
        id: "kf-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "nebula",
      });
      store.addKeyframe({
        id: "kf-2",
        keyframeUuid: "uuid-2",
        imageUrl: "https://example.com/2.jpg",
        name: "crystal",
      });
      store.setLoop(true);
      const result = useFlowStore.getState().keyframesWithLoop();
      expect(result).toHaveLength(3);
      expect(result[2].isLoopKeyframe).toBe(true);
      expect(result[2].keyframeUuid).toBe("uuid-1");
      expect(result[2].imageUrl).toBe("https://example.com/1.jpg");
      expect(result[2].name).toBe("nebula");
    });

    it("returns empty when no keyframes even with loop on", () => {
      useFlowStore.getState().setLoop(true);
      expect(useFlowStore.getState().keyframesWithLoop()).toEqual([]);
    });

    it("returns single keyframe without loop frame when only one keyframe", () => {
      const store = useFlowStore.getState();
      store.addKeyframe({
        id: "kf-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "nebula",
      });
      store.setLoop(true);
      const result = useFlowStore.getState().keyframesWithLoop();
      expect(result).toHaveLength(1);
    });
  });

  describe("resetFlow", () => {
    it("resets to initial state", () => {
      const store = useFlowStore.getState();
      store.addKeyframe({
        id: "kf-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "nebula",
      });
      store.setLoop(true);
      store.resetFlow();
      expect(useFlowStore.getState().keyframes).toEqual([]);
      expect(useFlowStore.getState().loop).toBe(false);
    });
  });
});

// Phase 1: transitions
const makeKf = (id: string, name = id) => ({
  id,
  keyframeUuid: `uuid-${id}`,
  imageUrl: `https://cdn.example.com/${id}.jpg`,
  name,
});

describe("Phase 1: transitions", () => {
  beforeEach(() => {
    useFlowStore.getState().resetFlow();
  });

  describe("recomputeTransitions", () => {
    it("creates transitions from adjacent keyframe pairs", () => {
      const store = useFlowStore.getState();
      store.addKeyframe(makeKf("a"));
      store.addKeyframe(makeKf("b"));
      store.addKeyframe(makeKf("c"));
      store.recomputeTransitions();

      const { transitions } = useFlowStore.getState();
      expect(transitions).toHaveLength(2);
      expect(transitions[0].fromKeyframeId).toBe("a");
      expect(transitions[0].toKeyframeId).toBe("b");
      expect(transitions[0].status).toBe("idle");
      expect(transitions[1].fromKeyframeId).toBe("b");
      expect(transitions[1].toKeyframeId).toBe("c");
    });

    it("creates no transitions with fewer than 2 keyframes", () => {
      const store = useFlowStore.getState();
      store.addKeyframe(makeKf("a"));
      store.recomputeTransitions();
      expect(useFlowStore.getState().transitions).toHaveLength(0);
    });

    it("preserves existing transition state when pairs still match", () => {
      const store = useFlowStore.getState();
      store.addKeyframe(makeKf("a"));
      store.addKeyframe(makeKf("b"));
      store.recomputeTransitions();

      // Simulate generation completing
      store.setTransitionDream(0, "dream-abc");
      store.updateTransitionStatus(0, "processed");
      store.setTransitionOverride(0, { promptOverride: "custom prompt" });

      // Recompute should preserve state
      store.recomputeTransitions();
      const { transitions } = useFlowStore.getState();
      expect(transitions[0].dreamUuid).toBe("dream-abc");
      expect(transitions[0].status).toBe("processed");
      expect(transitions[0].promptOverride).toBe("custom prompt");
    });

    it("adds loop transition with real keyframe IDs when loop enabled", () => {
      const store = useFlowStore.getState();
      store.addKeyframe(makeKf("a"));
      store.addKeyframe(makeKf("b"));
      store.addKeyframe(makeKf("c"));
      store.setLoop(true);
      store.recomputeTransitions();

      const { transitions } = useFlowStore.getState();
      expect(transitions).toHaveLength(3);
      // Loop transition: last → first, using real IDs
      expect(transitions[2].fromKeyframeId).toBe("c");
      expect(transitions[2].toKeyframeId).toBe("a");
    });

    it("removes loop transition when loop disabled", () => {
      const store = useFlowStore.getState();
      store.addKeyframe(makeKf("a"));
      store.addKeyframe(makeKf("b"));
      store.addKeyframe(makeKf("c"));
      store.setLoop(true);
      store.recomputeTransitions();
      expect(useFlowStore.getState().transitions).toHaveLength(3);

      store.setLoop(false);
      store.recomputeTransitions();
      expect(useFlowStore.getState().transitions).toHaveLength(2);
    });
  });

  describe("transition overrides", () => {
    it("sets per-transition overrides", () => {
      const store = useFlowStore.getState();
      store.addKeyframe(makeKf("a"));
      store.addKeyframe(makeKf("b"));
      store.recomputeTransitions();
      store.setTransitionOverride(0, {
        presetOverride: "Camera Basics",
        durationOverride: 8,
      });

      const t = useFlowStore.getState().transitions[0];
      expect(t.presetOverride).toBe("Camera Basics");
      expect(t.durationOverride).toBe(8);
    });

    it("clears all overrides on a transition", () => {
      const store = useFlowStore.getState();
      store.addKeyframe(makeKf("a"));
      store.addKeyframe(makeKf("b"));
      store.recomputeTransitions();
      store.setTransitionOverride(0, {
        presetOverride: "Organic",
        promptOverride: "test",
        durationOverride: 10,
        modelOverride: "ltx-i2v",
      });
      store.clearTransitionOverride(0);

      const t = useFlowStore.getState().transitions[0];
      expect(t.presetOverride).toBeUndefined();
      expect(t.promptOverride).toBeUndefined();
      expect(t.durationOverride).toBeUndefined();
      expect(t.modelOverride).toBeUndefined();
      expect(t.loraOverride).toBeUndefined();
    });
  });

  describe("transition status and dream tracking", () => {
    it("updates transition status and progress", () => {
      const store = useFlowStore.getState();
      store.addKeyframe(makeKf("a"));
      store.addKeyframe(makeKf("b"));
      store.recomputeTransitions();
      store.updateTransitionStatus(0, "processing", 50);

      const t = useFlowStore.getState().transitions[0];
      expect(t.status).toBe("processing");
      expect(t.progress).toBe(50);
    });

    it("stores dream UUID on a transition", () => {
      const store = useFlowStore.getState();
      store.addKeyframe(makeKf("a"));
      store.addKeyframe(makeKf("b"));
      store.recomputeTransitions();
      store.setTransitionDream(0, "dream-xyz");
      expect(useFlowStore.getState().transitions[0].dreamUuid).toBe(
        "dream-xyz",
      );
    });

    it("stores uprez dream UUID and updates uprez status", () => {
      const store = useFlowStore.getState();
      store.addKeyframe(makeKf("a"));
      store.addKeyframe(makeKf("b"));
      store.recomputeTransitions();
      store.setTransitionUprez(0, "uprez-789");
      store.updateTransitionUprezStatus(0, "processing", 30);

      const t = useFlowStore.getState().transitions[0];
      expect(t.uprezDreamUuid).toBe("uprez-789");
      expect(t.uprezStatus).toBe("processing");
      expect(t.uprezProgress).toBe(30);
    });
  });

  describe("global settings", () => {
    it("has correct defaults", () => {
      const s = useFlowStore.getState();
      expect(s.globalPresetId).toBe("");
      expect(s.globalPrompt).toBe("");
      expect(s.globalNegativePrompt).toBe("");
      expect(s.globalDuration).toBe(5);
      expect(s.globalModel).toBe("ltx-i2v");
      expect(s.globalNumInferenceSteps).toBe(30);
      expect(s.globalGuidance).toBe(5.0);
      expect(s.selectedTransitionIndex).toBeNull();
      expect(s.settingsExpanded).toBe(false);
    });

    it("sets global settings individually", () => {
      const store = useFlowStore.getState();
      store.setGlobalPreset("Organic");
      store.setGlobalPrompt("gentle drift");
      store.setGlobalNegativePrompt("blurry, distorted");
      store.setGlobalDuration(8);
      store.setGlobalModel("wan-i2v");
      store.setGlobalNumInferenceSteps(20);
      store.setGlobalGuidance(3.5);

      const s = useFlowStore.getState();
      expect(s.globalPresetId).toBe("Organic");
      expect(s.globalPrompt).toBe("gentle drift");
      expect(s.globalNegativePrompt).toBe("blurry, distorted");
      expect(s.globalDuration).toBe(8);
      expect(s.globalModel).toBe("wan-i2v");
      expect(s.globalNumInferenceSteps).toBe(20);
      expect(s.globalGuidance).toBe(3.5);
    });
  });

  describe("UI state", () => {
    it("selects and deselects transitions", () => {
      const store = useFlowStore.getState();
      store.selectTransition(2);
      expect(useFlowStore.getState().selectedTransitionIndex).toBe(2);
      store.selectTransition(null);
      expect(useFlowStore.getState().selectedTransitionIndex).toBeNull();
    });

    it("toggles settings expanded", () => {
      const store = useFlowStore.getState();
      store.setSettingsExpanded(true);
      expect(useFlowStore.getState().settingsExpanded).toBe(true);
      store.setSettingsExpanded(false);
      expect(useFlowStore.getState().settingsExpanded).toBe(false);
    });
  });

  describe("hydration", () => {
    it("resets stale processing/queue transitions to failed on recompute", () => {
      const store = useFlowStore.getState();
      store.addKeyframe(makeKf("a"));
      store.addKeyframe(makeKf("b"));
      store.addKeyframe(makeKf("c"));
      store.recomputeTransitions();

      // Simulate in-flight states (as if persisted mid-generation)
      store.updateTransitionStatus(0, "processing", 50);
      store.updateTransitionStatus(1, "queue");

      // Simulate what onRehydrateStorage does
      store.reconcileStaleTransitions();

      const { transitions } = useFlowStore.getState();
      expect(transitions[0].status).toBe("failed");
      expect(transitions[0].progress).toBeUndefined();
      expect(transitions[1].status).toBe("failed");
    });

    it("keeps in-flight transitions that have a dreamUuid (recoverable) so polling can recover them", () => {
      const store = useFlowStore.getState();
      store.addKeyframe(makeKf("a"));
      store.addKeyframe(makeKf("b"));
      store.recomputeTransitions();

      // A transition with a real backend job, still cooking.
      store.setTransitionDream(0, "dream-123");
      store.updateTransitionStatus(0, "processing", 50);

      store.reconcileStaleTransitions();

      const { transitions } = useFlowStore.getState();
      // Recoverable: left in-flight, not failed.
      expect(transitions[0].status).toBe("processing");
      expect(transitions[0].dreamUuid).toBe("dream-123");
    });

    it("does not reset processed or idle transitions", () => {
      const store = useFlowStore.getState();
      store.addKeyframe(makeKf("a"));
      store.addKeyframe(makeKf("b"));
      store.addKeyframe(makeKf("c"));
      store.recomputeTransitions();

      store.updateTransitionStatus(0, "processed");
      // leave transitions[1] as "idle"

      store.reconcileStaleTransitions();

      const { transitions } = useFlowStore.getState();
      expect(transitions[0].status).toBe("processed");
      expect(transitions[1].status).toBe("idle");
    });
  });
});
