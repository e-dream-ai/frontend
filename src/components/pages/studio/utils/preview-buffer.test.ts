import { describe, it, expect } from "vitest";
import {
  initialPreviewBuffer,
  backLayer,
  requestSegment,
  markReady,
  pruneSegments,
  type PreviewBufferState,
} from "./preview-buffer";

const A = "dream-a";
const B = "dream-b";
const C = "dream-c";

describe("preview-buffer", () => {
  describe("initialPreviewBuffer", () => {
    it("starts empty with layer 0 in front", () => {
      expect(initialPreviewBuffer()).toEqual({
        front: 0,
        loaded: [null, null],
        ready: [false, false],
      });
    });

    it("honours a start key", () => {
      expect(initialPreviewBuffer(A)).toEqual({
        front: 0,
        loaded: [A, null],
        ready: [false, false],
      });
    });
  });

  describe("backLayer", () => {
    it("returns the opposite layer", () => {
      expect(backLayer(0)).toBe(1);
      expect(backLayer(1)).toBe(0);
    });
  });

  describe("requestSegment", () => {
    it("is a no-op when the requested segment is already in front", () => {
      const state = initialPreviewBuffer(A);
      expect(requestSegment(state, A)).toBe(state);
    });

    it("loads a new segment into the back layer without swapping", () => {
      const next = requestSegment(initialPreviewBuffer(A), B);
      expect(next.front).toBe(0);
      expect(next.loaded).toEqual([A, B]);
      expect(next.ready).toEqual([false, false]);
    });

    it("does NOT swap while the back layer is still loading that segment", () => {
      // Re-requesting the in-flight segment must wait for its first frame rather
      // than reveal an undecoded layer — revealing early is what flashes black.
      const state = requestSegment(initialPreviewBuffer(A), B);
      const again = requestSegment(state, B);
      expect(again.front).toBe(0);
      // Nothing changed, so the same object comes back and no re-render happens.
      expect(again).toBe(state);
    });

    it("swaps instantly when the back layer already has it buffered and ready", () => {
      let s: PreviewBufferState = initialPreviewBuffer(A);
      s = markReady(s, 0, A); // front layer decoded A
      s = requestSegment(s, B); // back layer loads B
      s = markReady(s, 1, B); // B ready -> revealed
      expect(s.front).toBe(1);
      // Layer 0 still holds a decoded A, so going back is instant.
      const back = requestSegment(s, A);
      expect(back.front).toBe(0);
      expect(back.loaded).toEqual([A, B]);
    });

    it("re-arms readiness when the back layer is repointed at a new segment", () => {
      let s = requestSegment(initialPreviewBuffer(A), B);
      s = markReady(s, 1, B);
      expect(s.front).toBe(1); // showing B on layer 1; A still decoded on layer 0
      s = requestSegment(s, C); // C displaces A on layer 0
      expect(s.loaded).toEqual([C, B]);
      expect(s.ready[0]).toBe(false);
      expect(s.front).toBe(1); // still showing B until C decodes
    });
  });

  describe("markReady", () => {
    it("swaps the front to the back layer once its first frame decodes", () => {
      let s = requestSegment(initialPreviewBuffer(A), B);
      s = markReady(s, 1, B);
      expect(s.front).toBe(1);
      expect(s.ready[1]).toBe(true);
    });

    it("records readiness of the front layer without swapping", () => {
      const s = markReady(initialPreviewBuffer(A), 0, A);
      expect(s.front).toBe(0);
      expect(s.ready[0]).toBe(true);
    });

    it("ignores a stale event superseded by a newer request", () => {
      // Layer 1 was told to load B, then repointed at C before B ever decoded. A
      // late `loadeddata` for B must not reveal the layer that now holds C.
      let s = requestSegment(initialPreviewBuffer(A), B);
      s = requestSegment(s, C);
      expect(s.loaded).toEqual([A, C]);
      expect(markReady(s, 1, B)).toBe(s); // rejected outright
      expect(markReady(s, 1, C).front).toBe(1); // the real event reveals it
    });

    it("does not swap if the front already shows that segment", () => {
      const s = markReady(initialPreviewBuffer(A), 0, A);
      expect(s.front).toBe(0);
    });

    it("is a no-op when the front layer is already marked ready", () => {
      const s = markReady(initialPreviewBuffer(A), 0, A);
      expect(markReady(s, 0, A)).toBe(s);
    });
  });

  describe("pruneSegments", () => {
    it("keeps state untouched when every loaded segment still exists", () => {
      const s = requestSegment(initialPreviewBuffer(A), B);
      expect(pruneSegments(s, new Set([A, B, C]))).toBe(s);
    });

    it("clears a back layer whose segment disappeared", () => {
      let s = requestSegment(initialPreviewBuffer(A), B);
      s = pruneSegments(s, new Set([A]));
      expect(s.loaded).toEqual([A, null]);
      expect(s.ready[1]).toBe(false);
      expect(s.front).toBe(0);
    });

    it("falls back to the other layer when the visible segment disappeared", () => {
      let s = requestSegment(initialPreviewBuffer(A), B);
      s = markReady(s, 1, B);
      expect(s.front).toBe(1);
      // B goes away; layer 0 still holds A, so show that rather than nothing.
      s = pruneSegments(s, new Set([A]));
      expect(s.front).toBe(0);
      expect(s.loaded).toEqual([A, null]);
    });

    it("empties both layers when no segment survives", () => {
      const s = pruneSegments(
        requestSegment(initialPreviewBuffer(A), B),
        new Set<string>(),
      );
      expect(s.loaded).toEqual([null, null]);
      expect(s.ready).toEqual([false, false]);
    });
  });
});
