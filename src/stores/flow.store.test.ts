import { describe, it, expect, beforeEach } from "vitest";

const localStorageBacking: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => localStorageBacking[key] ?? null,
  setItem: (key: string, value: string) => {
    localStorageBacking[key] = value;
  },
  removeItem: (key: string) => {
    delete localStorageBacking[key];
  },
  clear: () => {
    Object.keys(localStorageBacking).forEach(
      (k) => delete localStorageBacking[k],
    );
  },
  get length() {
    return Object.keys(localStorageBacking).length;
  },
  key: (index: number) => Object.keys(localStorageBacking)[index] ?? null,
};

// Dynamic import after localStorage is set up (persist middleware needs it)
const { useFlowStore, MAX_TRANSITION_HISTORY } = await import("./flow.store");
const { DEFAULT_TRANSITION_SETTINGS } = await import(
  "../components/pages/studio/constants/default-transition-settings"
);
const { ACTION_PRESETS } = await import(
  "../components/pages/studio/constants/action-presets"
);

// Reset store between tests
beforeEach(() => {
  useFlowStore.getState().resetFlow();
});

/** Add `count + 1` frames so the store derives exactly `count` transitions. */
function seedTransitions(count: number) {
  useFlowStore.getState().resetFlow();
  for (let i = 0; i <= count; i++) {
    useFlowStore.getState().addReferenceFrame({
      id: `frame-${i}`,
      dreamUuid: `dream-${i}`,
      imageUrl: `url-${i}`,
      name: `frame ${i}`,
    });
  }
}

/** A run snapshot is just a copy of the settings the run used. */
const RUN_SETTINGS = { ...DEFAULT_TRANSITION_SETTINGS, prompt: "drift" };

describe("flow store", () => {
  describe("reference frames", () => {
    it("starts with no reference frames", () => {
      expect(useFlowStore.getState().referenceFrames).toEqual([]);
    });

    it("adds a frame", () => {
      useFlowStore.getState().addReferenceFrame({
        id: "frame-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/img.jpg",
        name: "nebula",
      });
      expect(useFlowStore.getState().referenceFrames).toHaveLength(1);
      expect(useFlowStore.getState().referenceFrames[0].name).toBe("nebula");
    });

    it("removes a frame by id", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame({
        id: "frame-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "nebula",
      });
      store.addReferenceFrame({
        id: "frame-2",
        keyframeUuid: "uuid-2",
        imageUrl: "https://example.com/2.jpg",
        name: "crystal",
      });
      useFlowStore.getState().removeReferenceFrame("frame-1");
      const frames = useFlowStore.getState().referenceFrames;
      expect(frames).toHaveLength(1);
      expect(frames[0].id).toBe("frame-2");
    });

    it("removes loop frames when filtering (loop frames are derived)", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame({
        id: "frame-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "nebula",
        isLoopFrame: true,
      });
      useFlowStore.getState().removeReferenceFrame("frame-1");
      expect(useFlowStore.getState().referenceFrames).toHaveLength(0);
    });

    it("reorders reference frames", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame({
        id: "frame-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "first",
      });
      store.addReferenceFrame({
        id: "frame-2",
        keyframeUuid: "uuid-2",
        imageUrl: "https://example.com/2.jpg",
        name: "second",
      });
      store.addReferenceFrame({
        id: "frame-3",
        keyframeUuid: "uuid-3",
        imageUrl: "https://example.com/3.jpg",
        name: "third",
      });
      useFlowStore
        .getState()
        .reorderReferenceFrames(["frame-3", "frame-1", "frame-2"]);
      const ids = useFlowStore.getState().referenceFrames.map((k) => k.id);
      expect(ids).toEqual(["frame-3", "frame-1", "frame-2"]);
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

  describe("derived: referenceFramesWithLoop", () => {
    it("returns reference frames as-is when loop is off", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame({
        id: "frame-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "nebula",
      });
      store.addReferenceFrame({
        id: "frame-2",
        keyframeUuid: "uuid-2",
        imageUrl: "https://example.com/2.jpg",
        name: "crystal",
      });
      const result = useFlowStore.getState().referenceFramesWithLoop();
      expect(result).toHaveLength(2);
      expect(result.every((k) => !k.isLoopFrame)).toBe(true);
    });

    it("appends loop frame mirroring first when loop is on", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame({
        id: "frame-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "nebula",
      });
      store.addReferenceFrame({
        id: "frame-2",
        keyframeUuid: "uuid-2",
        imageUrl: "https://example.com/2.jpg",
        name: "crystal",
      });
      store.setLoop(true);
      const result = useFlowStore.getState().referenceFramesWithLoop();
      expect(result).toHaveLength(3);
      expect(result[2].isLoopFrame).toBe(true);
      expect(result[2].keyframeUuid).toBe("uuid-1");
      expect(result[2].imageUrl).toBe("https://example.com/1.jpg");
      expect(result[2].name).toBe("nebula");
    });

    it("returns empty when no reference frames even with loop on", () => {
      useFlowStore.getState().setLoop(true);
      expect(useFlowStore.getState().referenceFramesWithLoop()).toEqual([]);
    });

    it("returns single frame without loop frame when only one frame", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame({
        id: "frame-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "nebula",
      });
      store.setLoop(true);
      const result = useFlowStore.getState().referenceFramesWithLoop();
      expect(result).toHaveLength(1);
    });
  });

  describe("resetFlow", () => {
    it("resets to initial state", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame({
        id: "frame-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "nebula",
      });
      store.setLoop(true);
      store.resetFlow();
      expect(useFlowStore.getState().referenceFrames).toEqual([]);
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
    it("creates transitions from adjacent frame pairs", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.addReferenceFrame(makeKf("c"));
      store.recomputeTransitions();

      const { transitions } = useFlowStore.getState();
      expect(transitions).toHaveLength(2);
      expect(transitions[0].fromFrameId).toBe("a");
      expect(transitions[0].toFrameId).toBe("b");
      expect(transitions[0].status).toBe("idle");
      expect(transitions[1].fromFrameId).toBe("b");
      expect(transitions[1].toFrameId).toBe("c");
    });

    it("creates no transitions with fewer than 2 reference frames", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.recomputeTransitions();
      expect(useFlowStore.getState().transitions).toHaveLength(0);
    });

    it("preserves existing transition state when pairs still match", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.recomputeTransitions();

      // Simulate generation completing
      store.setTransitionDream(0, "dream-abc");
      store.updateTransitionStatus(0, "processed");
      store.setTransitionSettings([0], { prompt: "custom prompt" });

      // Recompute should preserve state
      store.recomputeTransitions();
      const { transitions } = useFlowStore.getState();
      expect(transitions[0].dreamUuid).toBe("dream-abc");
      expect(transitions[0].status).toBe("processed");
      expect(transitions[0].settings.prompt).toBe("custom prompt");
    });

    it("adds loop transition with real frame IDs when loop enabled", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.addReferenceFrame(makeKf("c"));
      store.setLoop(true);
      store.recomputeTransitions();

      const { transitions } = useFlowStore.getState();
      expect(transitions).toHaveLength(3);
      // Loop transition: last → first, using real IDs
      expect(transitions[2].fromFrameId).toBe("c");
      expect(transitions[2].toFrameId).toBe("a");
    });

    it("removes loop transition when loop disabled", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.addReferenceFrame(makeKf("c"));
      store.setLoop(true);
      store.recomputeTransitions();
      expect(useFlowStore.getState().transitions).toHaveLength(3);

      store.setLoop(false);
      store.recomputeTransitions();
      expect(useFlowStore.getState().transitions).toHaveLength(2);
    });
  });

  describe("transition settings", () => {
    it("writes fields onto one transition", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.recomputeTransitions();
      store.setTransitionSettings([0], { duration: 8, prompt: "swirl" });

      const t = useFlowStore.getState().transitions[0];
      expect(t.settings.duration).toBe(8);
      expect(t.settings.prompt).toBe("swirl");
    });

    it("writes the same fields onto several transitions at once", () => {
      const store = useFlowStore.getState();
      for (const id of ["a", "b", "c"]) store.addReferenceFrame(makeKf(id));
      store.recomputeTransitions();
      store.setTransitionSettings([0, 1], { duration: 10 });

      const { transitions } = useFlowStore.getState();
      expect(transitions.map((t) => t.settings.duration)).toEqual([10, 10]);
    });

    it("leaves untouched fields alone", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.recomputeTransitions();
      const before = useFlowStore.getState().transitions[0].settings;
      store.setTransitionSettings([0], { seed: 7 });

      const after = useFlowStore.getState().transitions[0].settings;
      expect(after.seed).toBe(7);
      expect(after.prompt).toBe(before.prompt);
      expect(after.model).toBe(before.model);
    });

    it("does not touch a transition outside the given indices", () => {
      // The heart of dropping inheritance: one write reaches exactly the
      // transitions named, and nothing else can pick the value up later.
      const store = useFlowStore.getState();
      for (const id of ["a", "b", "c"]) store.addReferenceFrame(makeKf(id));
      store.recomputeTransitions();
      store.setTransitionSettings([0], { prompt: "only me" });

      const { transitions } = useFlowStore.getState();
      expect(transitions[0].settings.prompt).toBe("only me");
      expect(transitions[1].settings.prompt).toBe(
        DEFAULT_TRANSITION_SETTINGS.prompt,
      );
    });
  });

  describe("selection follows the transition list", () => {
    it("starts with nothing selected, which means the whole flow", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      expect(useFlowStore.getState().transitions).toHaveLength(1);
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([]);
    });

    it("leaves an empty selection empty as frames are added", () => {
      const store = useFlowStore.getState();
      for (const id of ["a", "b", "c", "d"])
        store.addReferenceFrame(makeKf(id));
      expect(useFlowStore.getState().transitions).toHaveLength(3);
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([]);
    });

    it("extends an all-selection onto transitions added after it", () => {
      const store = useFlowStore.getState();
      for (const id of ["a", "b", "c"]) store.addReferenceFrame(makeKf(id));
      store.selectAllTransitions();
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([0, 1]);

      store.addReferenceFrame(makeKf("d"));
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([
        0, 1, 2,
      ]);
    });

    it("leaves a narrowed selection narrow when a frame is added", () => {
      const store = useFlowStore.getState();
      for (const id of ["a", "b", "c"]) store.addReferenceFrame(makeKf(id));
      store.selectTransition(0);
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([0]);

      store.addReferenceFrame(makeKf("d"));
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([0]);
    });

    it("keeps the selection whole when reordering frames", () => {
      const store = useFlowStore.getState();
      for (const id of ["a", "b", "c"]) store.addReferenceFrame(makeKf(id));
      store.selectAllTransitions();
      store.reorderReferenceFrames(["c", "a", "b"]);
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([0, 1]);
    });

    it("grows the selection when looping adds a transition", () => {
      const store = useFlowStore.getState();
      for (const id of ["a", "b", "c"]) store.addReferenceFrame(makeKf(id));
      store.selectAllTransitions();
      store.setLoop(true);
      expect(useFlowStore.getState().transitions).toHaveLength(3);
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([
        0, 1, 2,
      ]);
    });

    it("drops indices the rebuilt list no longer has", () => {
      const store = useFlowStore.getState();
      for (const id of ["a", "b", "c"]) store.addReferenceFrame(makeKf(id));
      store.selectTransition(1);
      store.removeReferenceFrame("c");
      expect(useFlowStore.getState().transitions).toHaveLength(1);
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([]);
    });
  });

  describe("new transitions inherit nothing, they copy", () => {
    it("seeds the first transition from the built-in default", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.recomputeTransitions();
      expect(useFlowStore.getState().transitions[0].settings).toEqual(
        DEFAULT_TRANSITION_SETTINGS,
      );
    });

    it("copies the previous transition's settings for a frame added at the end", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.recomputeTransitions();
      store.setTransitionSettings([0], { prompt: "swirl", duration: 8 });

      store.addReferenceFrame(makeKf("c"));
      store.recomputeTransitions();

      const { transitions } = useFlowStore.getState();
      expect(transitions).toHaveLength(2);
      expect(transitions[1].settings.prompt).toBe("swirl");
      expect(transitions[1].settings.duration).toBe(8);
    });

    it("copies, so editing the new one does not touch its source", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.recomputeTransitions();
      store.setTransitionSettings([0], { prompt: "swirl" });
      store.addReferenceFrame(makeKf("c"));
      store.recomputeTransitions();

      store.setTransitionSettings([1], { prompt: "drift" });
      const { transitions } = useFlowStore.getState();
      expect(transitions[0].settings.prompt).toBe("swirl");
      expect(transitions[1].settings.prompt).toBe("drift");
    });

    it("takes the new neighbour's settings for a frame inserted in the middle", () => {
      const store = useFlowStore.getState();
      for (const id of ["a", "b", "c"]) store.addReferenceFrame(makeKf(id));
      store.recomputeTransitions();
      store.setTransitionSettings([0], { prompt: "first" });
      store.setTransitionSettings([1], { prompt: "second" });

      // a -> x -> b -> c: the a:x pair is new and sits at index 0, so it has
      // no predecessor and falls back to the default; x:b follows it.
      store.addReferenceFrame(makeKf("x"));
      store.reorderReferenceFrames(["a", "x", "b", "c"]);
      store.recomputeTransitions();

      const { transitions } = useFlowStore.getState();
      expect(transitions).toHaveLength(3);
      expect(transitions[0].settings.prompt).toBe(
        DEFAULT_TRANSITION_SETTINGS.prompt,
      );
      expect(transitions[1].settings.prompt).toBe(
        transitions[0].settings.prompt,
      );
      // b -> c survived untouched.
      expect(transitions[2].settings.prompt).toBe("second");
    });
  });

  describe("transition status and dream tracking", () => {
    it("updates transition status and progress", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.recomputeTransitions();
      store.updateTransitionStatus(0, "processing", 50);

      const t = useFlowStore.getState().transitions[0];
      expect(t.status).toBe("processing");
      expect(t.progress).toBe(50);
    });

    it("stores dream UUID on a transition", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.recomputeTransitions();
      store.setTransitionDream(0, "dream-xyz");
      expect(useFlowStore.getState().transitions[0].dreamUuid).toBe(
        "dream-xyz",
      );
    });

    it("stores uprez dream UUID and updates uprez status", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.recomputeTransitions();
      store.setTransitionUprez(0, "uprez-789");
      store.updateTransitionUprezStatus(0, "processing", 30);

      const t = useFlowStore.getState().transitions[0];
      expect(t.uprezDreamUuid).toBe("uprez-789");
      expect(t.uprezStatus).toBe("processing");
      expect(t.uprezProgress).toBe(30);
    });
  });

  describe("migration v4 → v5", () => {
    it("resets Wan-scaled guidance and drops per-transition overrides", () => {
      const v4State = {
        globalGuidance: 5.0,
        transitions: [
          { fromKeyframeId: "a", toKeyframeId: "b", guidanceOverride: 6.5 },
          { fromKeyframeId: "b", toKeyframeId: "c", durationOverride: 10 },
        ],
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const migrate = (useFlowStore as any).persist?.getOptions?.()?.migrate;
      const migrated = migrate(v4State, 4) as Record<string, unknown>;

      // v7 runs on the way out, so the guidance reset lands as a value on each
      // transition rather than as a global.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transitions = migrated.transitions as any[];
      expect(migrated).not.toHaveProperty("globalGuidance");
      expect(transitions[0].settings.guidance).toBe(0.5);
      expect(transitions[0]).not.toHaveProperty("guidanceOverride");
      expect(transitions[1].settings.duration).toBe(10);
    });
  });

  describe("migration v6 → v7 (overrides → settings, #728)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const migrate = (useFlowStore as any).persist?.getOptions?.()?.migrate;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const run = (state: unknown) => migrate(state, 6) as any;

    it("materialises the global a transition used to inherit", () => {
      const migrated = run({
        globalPrompt: "drift",
        globalDuration: 8,
        transitions: [{ fromFrameId: "a", toFrameId: "b", status: "idle" }],
      });
      expect(migrated.transitions[0].settings.prompt).toBe("drift");
      expect(migrated.transitions[0].settings.duration).toBe(8);
    });

    it("keeps an override in preference to the global", () => {
      const migrated = run({
        globalPrompt: "drift",
        transitions: [
          { fromFrameId: "a", toFrameId: "b", promptOverride: "swirl" },
        ],
      });
      expect(migrated.transitions[0].settings.prompt).toBe("swirl");
    });

    it("treats an empty-string override as a real value, not absence", () => {
      const migrated = run({
        globalNegativePrompt: "blurry",
        transitions: [
          { fromFrameId: "a", toFrameId: "b", negativePromptOverride: "" },
        ],
      });
      expect(migrated.transitions[0].settings.negativePrompt).toBe("");
    });

    it("falls through to the preset's prompt when nothing else stored one", () => {
      const migrated = run({
        globalPresetId: "Abstract",
        globalPrompt: "",
        transitions: [{ fromFrameId: "a", toFrameId: "b" }],
      });
      expect(migrated.transitions[0].settings.prompt).toBe(
        DEFAULT_TRANSITION_SETTINGS.prompt,
      );
    });

    it("recovers the preset's low-noise LoRAs when the high set still matches", () => {
      // The old resolver read the pack's *first* action, so the fixture must
      // use a pack whose first action carries the LoRAs.
      const preset = ACTION_PRESETS.find(
        (pack) => pack.actions[0]?.lowNoiseLoras?.length,
      );
      if (!preset) return;
      const action = preset.actions[0];
      const migrated = run({
        globalPresetId: preset.name,
        transitions: [
          {
            fromFrameId: "a",
            toFrameId: "b",
            loraOverride: action.highNoiseLoras,
          },
        ],
      });
      expect(migrated.transitions[0].settings.lowNoiseLoras).toEqual(
        action.lowNoiseLoras,
      );
    });

    it("gives two transitions that shared a global their own copies", () => {
      // The behaviour change, made concrete: after migrating, editing one can
      // no longer move the other.
      const migrated = run({
        globalPrompt: "drift",
        transitions: [
          { fromFrameId: "a", toFrameId: "b" },
          { fromFrameId: "b", toFrameId: "c" },
        ],
      });
      const [first, second] = migrated.transitions;
      expect(first.settings.prompt).toBe("drift");
      expect(second.settings.prompt).toBe("drift");
      expect(first.settings).not.toBe(second.settings);
    });

    it("converts a recorded run snapshot too, so restore still works", () => {
      const migrated = run({
        globalPrompt: "drift",
        transitions: [
          {
            fromFrameId: "a",
            toFrameId: "b",
            status: "processed",
            dreamUuid: "dream-1",
            history: [
              {
                dreamUuid: "dream-1",
                createdAt: 1,
                completed: true,
                settings: {
                  promptOverride: "as rendered",
                  durationOverride: 10,
                },
              },
            ],
          },
        ],
      });
      const entry = migrated.transitions[0].history[0];
      expect(entry.settings.prompt).toBe("as rendered");
      expect(entry.settings.duration).toBe(10);
      expect(entry.settings).not.toHaveProperty("promptOverride");
    });

    it("leaves a history entry that never had settings alone", () => {
      const migrated = run({
        transitions: [
          {
            fromFrameId: "a",
            toFrameId: "b",
            history: [{ dreamUuid: "dream-1", createdAt: 1, completed: true }],
          },
        ],
      });
      expect(migrated.transitions[0].history[0].settings).toBeUndefined();
    });

    it("drops the override keys and the globals", () => {
      const migrated = run({
        globalPrompt: "drift",
        globalLora: [],
        transitions: [
          { fromFrameId: "a", toFrameId: "b", promptOverride: "swirl" },
        ],
      });
      expect(migrated).not.toHaveProperty("globalPrompt");
      expect(migrated).not.toHaveProperty("globalLora");
      expect(migrated.transitions[0]).not.toHaveProperty("promptOverride");
    });
  });

  describe("migration v5 → v6 (keyframe → reference frame, #719)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const migrate = (useFlowStore as any).persist?.getOptions?.()?.migrate;

    it("renames keyframes onto referenceFrames and maps isLoopKeyframe", () => {
      const migrated = migrate(
        {
          keyframes: [
            { id: "a", dreamUuid: "d1", imageUrl: "u1", name: "one" },
            { id: "b", dreamUuid: "d2", imageUrl: "u2", isLoopKeyframe: true },
          ],
        },
        5,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any;

      expect(migrated).not.toHaveProperty("keyframes");
      expect(migrated.referenceFrames).toHaveLength(2);
      expect(migrated.referenceFrames[0].id).toBe("a");
      expect(migrated.referenceFrames[1].isLoopFrame).toBe(true);
      expect(migrated.referenceFrames[1]).not.toHaveProperty("isLoopKeyframe");
    });

    it("keeps keyframeUuid — it still points at a backend Keyframe", () => {
      const migrated = migrate(
        { keyframes: [{ id: "a", keyframeUuid: "kf-uuid", dreamUuid: "d1" }] },
        5,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any;

      expect(migrated.referenceFrames[0].keyframeUuid).toBe("kf-uuid");
    });

    it("renames the transition endpoint ids", () => {
      const migrated = migrate(
        {
          transitions: [
            { fromKeyframeId: "a", toKeyframeId: "b", status: "processed" },
          ],
        },
        5,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any;

      expect(migrated.transitions[0].fromFrameId).toBe("a");
      expect(migrated.transitions[0].toFrameId).toBe("b");
      expect(migrated.transitions[0]).not.toHaveProperty("fromKeyframeId");
      expect(migrated.transitions[0].status).toBe("processed");
    });

    it("runs the rename for stores several versions behind", () => {
      // The version chain below returns early per version, so a v2 store would
      // otherwise keep the legacy keys and rehydrate with an empty flow.
      const migrated = migrate(
        { keyframes: [{ id: "a", dreamUuid: "d1" }] },
        2,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any;

      expect(migrated.referenceFrames).toHaveLength(1);
      expect(migrated).not.toHaveProperty("keyframes");
    });

    it("is a no-op on state already using the new keys", () => {
      const migrated = migrate(
        {
          referenceFrames: [{ id: "a", isLoopFrame: true }],
          transitions: [{ fromFrameId: "a", toFrameId: "b", status: "idle" }],
        },
        6,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any;

      expect(migrated.referenceFrames[0].isLoopFrame).toBe(true);
      expect(migrated.transitions[0].fromFrameId).toBe("a");
      expect(migrated.transitions[0].toFrameId).toBe("b");
    });
  });

  describe("global settings", () => {
    it("has correct defaults", () => {
      const s = useFlowStore.getState();
      expect(s.transitions).toEqual([]);
      expect(s.selectedTransitionIndices).toEqual([]);
      expect(s.settingsExpanded).toBe(false);
    });

    it("seeds a transition from the built-in default", () => {
      seedTransitions(1);
      expect(useFlowStore.getState().transitions[0].settings).toEqual(
        DEFAULT_TRANSITION_SETTINGS,
      );
    });
  });

  describe("UI state", () => {
    it("selects transitions", () => {
      seedTransitions(4);
      useFlowStore.getState().selectTransition(2);
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([2]);
    });

    it("deselects everything when asked to select nothing", () => {
      seedTransitions(3);
      useFlowStore.getState().selectTransition(null);
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([]);
    });

    it("deselects everything when an index names no transition", () => {
      seedTransitions(2);
      useFlowStore.getState().selectTransition(9);
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([]);
    });

    it("toggles off the only selected transition", () => {
      seedTransitions(3);
      const store = () => useFlowStore.getState();
      store().selectTransition(1);
      store().toggleTransitionSelection(1);
      expect(store().selectedTransitionIndices).toEqual([]);
    });

    it("toggles one off while others remain selected", () => {
      seedTransitions(3);
      const store = () => useFlowStore.getState();
      store().selectAllTransitions();
      store().toggleTransitionSelection(1);
      expect(store().selectedTransitionIndices).toEqual([0, 2]);
      store().toggleTransitionSelection(2);
      expect(store().selectedTransitionIndices).toEqual([0]);
      store().toggleTransitionSelection(0);
      expect(store().selectedTransitionIndices).toEqual([]);
    });

    it("keeps an empty selection when there is nothing to select", () => {
      expect(useFlowStore.getState().transitions).toHaveLength(0);
      useFlowStore.getState().selectTransition(null);
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([]);
    });

    it("toggles indices in and out, keeping click order", () => {
      seedTransitions(4);
      const store = () => useFlowStore.getState();
      store().selectTransition(1);
      store().toggleTransitionSelection(3);
      store().toggleTransitionSelection(0);
      // Newest click stays last — it is the primary the panel names.
      expect(store().selectedTransitionIndices).toEqual([1, 3, 0]);

      store().toggleTransitionSelection(3);
      expect(store().selectedTransitionIndices).toEqual([1, 0]);
    });

    it("selects all", () => {
      seedTransitions(3);
      useFlowStore.getState().selectAllTransitions();
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([
        0, 1, 2,
      ]);
    });

    it("clearing lands on nothing, which Generate reads as the whole flow", () => {
      seedTransitions(3);
      useFlowStore.getState().selectTransition(1);
      useFlowStore.getState().clearTransitionSelection();
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([]);
    });

    it("drops selected indices when deleting a frame shortens the flow", () => {
      seedTransitions(4);
      useFlowStore.getState().selectAllTransitions();
      expect(useFlowStore.getState().selectedTransitionIndices).toHaveLength(4);

      useFlowStore.getState().removeReferenceFrame("frame-4");
      useFlowStore.getState().removeReferenceFrame("frame-3");

      expect(useFlowStore.getState().transitions).toHaveLength(2);
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([0, 1]);
    });

    it("prunes on demand for state handed over by a session restore", () => {
      seedTransitions(2);
      useFlowStore.setState({ selectedTransitionIndices: [0, 1, 7] });
      useFlowStore.getState().pruneTransitionSelection();
      expect(useFlowStore.getState().selectedTransitionIndices).toEqual([0, 1]);
    });

    it("replays on every play request, including a repeat of the same dream", () => {
      const store = () => useFlowStore.getState();
      expect(store().previewPlayRequest).toBeNull();

      store().requestPreviewPlay("dream-a");
      expect(store().previewPlayRequest).toEqual({
        dreamUuid: "dream-a",
        seq: 1,
      });

      // Same dream again: the uuid is unchanged, so the sequence number is the
      // only thing telling the preview a fresh replay was asked for.
      store().requestPreviewPlay("dream-a");
      expect(store().previewPlayRequest).toEqual({
        dreamUuid: "dream-a",
        seq: 2,
      });

      store().requestPreviewPlay("dream-b");
      expect(store().previewPlayRequest).toEqual({
        dreamUuid: "dream-b",
        seq: 3,
      });
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
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.addReferenceFrame(makeKf("c"));
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

    it("does not reset processed or idle transitions", () => {
      const store = useFlowStore.getState();
      store.addReferenceFrame(makeKf("a"));
      store.addReferenceFrame(makeKf("b"));
      store.addReferenceFrame(makeKf("c"));
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

describe("frame lightbox (#694)", () => {
  beforeEach(() => {
    useFlowStore.getState().resetFlow();
  });

  it("is closed by default", () => {
    expect(useFlowStore.getState().frameLightboxId).toBeNull();
  });

  it("opens on an existing frame", () => {
    const store = useFlowStore.getState();
    store.addReferenceFrame(makeKf("a"));
    store.addReferenceFrame(makeKf("b"));
    store.openFrameLightbox("b");
    expect(useFlowStore.getState().frameLightboxId).toBe("b");
  });

  it("ignores an unknown frame id (stays closed)", () => {
    const store = useFlowStore.getState();
    store.addReferenceFrame(makeKf("a"));
    store.openFrameLightbox("nope");
    expect(useFlowStore.getState().frameLightboxId).toBeNull();
  });

  it("steps forward and clamps at the last frame", () => {
    const store = useFlowStore.getState();
    store.addReferenceFrame(makeKf("a"));
    store.addReferenceFrame(makeKf("b"));
    store.openFrameLightbox("a");
    store.stepFrameLightbox(1);
    expect(useFlowStore.getState().frameLightboxId).toBe("b");
    store.stepFrameLightbox(1);
    expect(useFlowStore.getState().frameLightboxId).toBe("b");
  });

  it("steps backward and clamps at the first frame", () => {
    const store = useFlowStore.getState();
    store.addReferenceFrame(makeKf("a"));
    store.addReferenceFrame(makeKf("b"));
    store.openFrameLightbox("b");
    store.stepFrameLightbox(-1);
    expect(useFlowStore.getState().frameLightboxId).toBe("a");
    store.stepFrameLightbox(-1);
    expect(useFlowStore.getState().frameLightboxId).toBe("a");
  });

  it("closes", () => {
    const store = useFlowStore.getState();
    store.addReferenceFrame(makeKf("a"));
    store.openFrameLightbox("a");
    store.closeFrameLightbox();
    expect(useFlowStore.getState().frameLightboxId).toBeNull();
  });

  it("keeps showing the same frame when an earlier one is deleted", () => {
    const store = useFlowStore.getState();
    store.addReferenceFrame(makeKf("a"));
    store.addReferenceFrame(makeKf("b"));
    store.openFrameLightbox("b");
    store.removeReferenceFrame("a");
    // Index-keyed state would now be pointing at a different image.
    expect(useFlowStore.getState().frameLightboxId).toBe("b");
  });

  it("closes when the frame it is showing is deleted", () => {
    const store = useFlowStore.getState();
    store.addReferenceFrame(makeKf("a"));
    store.addReferenceFrame(makeKf("b"));
    store.openFrameLightbox("b");
    store.removeReferenceFrame("b");
    expect(useFlowStore.getState().frameLightboxId).toBeNull();
  });

  it("survives a reorder without changing the shown frame", () => {
    const store = useFlowStore.getState();
    store.addReferenceFrame(makeKf("a"));
    store.addReferenceFrame(makeKf("b"));
    store.openFrameLightbox("a");
    store.reorderReferenceFrames(["b", "a"]);
    expect(useFlowStore.getState().frameLightboxId).toBe("a");
    // "a" is last now, so forward navigation is exhausted.
    store.stepFrameLightbox(1);
    expect(useFlowStore.getState().frameLightboxId).toBe("a");
    store.stepFrameLightbox(-1);
    expect(useFlowStore.getState().frameLightboxId).toBe("b");
  });

  it("resetFlow closes the lightbox", () => {
    const store = useFlowStore.getState();
    store.addReferenceFrame(makeKf("a"));
    store.openFrameLightbox("a");
    store.resetFlow();
    expect(useFlowStore.getState().frameLightboxId).toBeNull();
  });
});

describe("transition run history", () => {
  const store = () => useFlowStore.getState();

  it("records a run and marks it completed only once it renders", () => {
    seedTransitions(1);
    store().recordTransitionRun(0, "dream-a", RUN_SETTINGS, 1000);

    let t = store().transitions[0];
    expect(t.dreamUuid).toBe("dream-a");
    expect(t.history).toHaveLength(1);
    expect(t.history?.[0].completed).toBeUndefined();

    store().updateTransitionStatus(0, "processed");
    t = store().transitions[0];
    expect(t.history?.[0].completed).toBe(true);
  });

  it("keeps every take at a position across regenerations", () => {
    seedTransitions(1);
    store().recordTransitionRun(0, "dream-a", RUN_SETTINGS, 1000);
    store().updateTransitionStatus(0, "processed");
    store().recordTransitionRun(
      0,
      "dream-b",
      { ...RUN_SETTINGS, promptOverride: "swirl" },
      2000,
    );
    store().updateTransitionStatus(0, "processed");

    const t = store().transitions[0];
    expect(t.history?.map((e) => e.dreamUuid)).toEqual(["dream-a", "dream-b"]);
    expect(t.dreamUuid).toBe("dream-b");
  });

  it("does not duplicate a row when the same dream is re-recorded", () => {
    seedTransitions(1);
    store().recordTransitionRun(0, "dream-a", RUN_SETTINGS, 1000);
    store().recordTransitionRun(0, "dream-a", RUN_SETTINGS, 3000);

    const history = store().transitions[0].history;
    expect(history).toHaveLength(1);
    expect(history?.[0].createdAt).toBe(3000);
  });

  it("drops the uprez when a new run replaces the dream", () => {
    seedTransitions(1);
    store().recordTransitionRun(0, "dream-a", RUN_SETTINGS, 1000);
    store().setTransitionUprez(0, "uprez-a");
    store().updateTransitionUprezStatus(0, "processed");

    store().recordTransitionRun(0, "dream-b", RUN_SETTINGS, 2000);
    const t = store().transitions[0];
    expect(t.uprezDreamUuid).toBeUndefined();
    expect(t.uprezStatus).toBeUndefined();
  });

  it("restores a completed take with the settings it ran under", () => {
    seedTransitions(1);
    store().recordTransitionRun(
      0,
      "dream-a",
      { ...RUN_SETTINGS, prompt: "first take", duration: 5 },
      1000,
    );
    store().updateTransitionStatus(0, "processed");
    store().recordTransitionRun(
      0,
      "dream-b",
      { ...RUN_SETTINGS, prompt: "second take", duration: 8 },
      2000,
    );
    store().updateTransitionStatus(0, "processed");
    store().setTransitionSettings([0], { prompt: "second take", duration: 8 });

    store().restoreTransitionRun(0, "dream-a");

    const t = store().transitions[0];
    expect(t.dreamUuid).toBe("dream-a");
    expect(t.status).toBe("processed");
    expect(t.settings.prompt).toBe("first take");
    expect(t.settings.duration).toBe(5);
    // Both takes stay available — restoring is not destructive.
    expect(t.history).toHaveLength(2);
  });

  it("refuses to restore a take that never completed", () => {
    seedTransitions(1);
    store().recordTransitionRun(0, "dream-a", RUN_SETTINGS, 1000);
    store().updateTransitionStatus(0, "processed");
    store().recordTransitionRun(0, "dream-b", RUN_SETTINGS, 2000);
    store().updateTransitionStatus(0, "failed");

    store().restoreTransitionRun(0, "dream-b");
    expect(store().transitions[0].dreamUuid).toBe("dream-b");
    expect(store().transitions[0].status).toBe("failed");
  });

  it("keeps history when settings are reset to the default", () => {
    seedTransitions(1);
    store().recordTransitionRun(0, "dream-a", RUN_SETTINGS, 1000);
    store().updateTransitionStatus(0, "processed");
    store().setTransitionSettings([0], { prompt: "custom" });

    // Past runs are results, not settings — rewriting settings must not throw
    // them away.
    store().setTransitionSettings([0], { ...DEFAULT_TRANSITION_SETTINGS });

    const t = store().transitions[0];
    expect(t.settings).toEqual(DEFAULT_TRANSITION_SETTINGS);
    expect(t.history).toHaveLength(1);
  });

  it("caps history growth", () => {
    seedTransitions(1);
    for (let i = 0; i < MAX_TRANSITION_HISTORY + 5; i++) {
      store().recordTransitionRun(0, `dream-${i}`, RUN_SETTINGS, 1000 + i);
    }
    const history = store().transitions[0].history;
    expect(history).toHaveLength(MAX_TRANSITION_HISTORY);
    // The oldest takes fall off the front, not the newest off the back.
    expect(history?.[history.length - 1].dreamUuid).toBe(
      `dream-${MAX_TRANSITION_HISTORY + 4}`,
    );
  });
});
