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

    it("does not remove loop keyframes", () => {
      const store = useFlowStore.getState();
      store.addKeyframe({
        id: "kf-1",
        keyframeUuid: "uuid-1",
        imageUrl: "https://example.com/1.jpg",
        name: "nebula",
        isLoopKeyframe: true,
      });
      useFlowStore.getState().removeKeyframe("kf-1");
      expect(useFlowStore.getState().keyframes).toHaveLength(1);
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
