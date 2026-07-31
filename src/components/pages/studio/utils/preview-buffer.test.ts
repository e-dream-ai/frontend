import { describe, it, expect } from "vitest";
import {
  initialPreviewBuffer,
  backLayer,
  requestIndex,
  ready,
  type PreviewBufferState,
} from "./preview-buffer";

describe("preview-buffer", () => {
  describe("initialPreviewBuffer", () => {
    it("starts with layer 0 in front showing the start index", () => {
      expect(initialPreviewBuffer()).toEqual({
        front: 0,
        loaded: [0, null],
        ready: [false, false],
      });
    });

    it("honours a custom start index", () => {
      expect(initialPreviewBuffer(3)).toEqual({
        front: 0,
        loaded: [3, null],
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

  describe("requestIndex", () => {
    it("is a no-op when the requested index is already in front", () => {
      const state = initialPreviewBuffer(0);
      expect(requestIndex(state, 0)).toBe(state);
    });

    it("loads a new index into the back layer without swapping", () => {
      const state = initialPreviewBuffer(0);
      const next = requestIndex(state, 1);
      // front unchanged, back layer now targets segment 1, not yet ready
      expect(next.front).toBe(0);
      expect(next.loaded).toEqual([0, 1]);
      expect(next.ready).toEqual([false, false]);
    });

    it("does NOT swap immediately when the back layer holds the index but isn't ready yet", () => {
      // request 1 (loads on back, not ready); requesting 1 again must wait, not flash black
      const state = requestIndex(initialPreviewBuffer(0), 1);
      const again = requestIndex(state, 1);
      expect(again.front).toBe(0); // still showing front, no premature swap
    });

    it("swaps instantly when the back layer already has the index buffered and ready", () => {
      // show 0 (front layer 0, ready), buffer + reveal 1, then go back to 0
      let s: PreviewBufferState = initialPreviewBuffer(0);
      s = ready(s, 0, 0); // front layer 0 decoded segment 0
      s = requestIndex(s, 1); // back layer 1 loads segment 1
      s = ready(s, 1, 1); // segment 1 ready -> swaps to front
      expect(s.front).toBe(1);
      // layer 0 still holds segment 0 and is ready -> revisiting is instant
      const back = requestIndex(s, 0);
      expect(back.front).toBe(0);
      expect(back.loaded).toEqual([0, 1]);
    });
  });

  describe("ready", () => {
    it("swaps the front to the back layer once its first frame decodes", () => {
      let s = requestIndex(initialPreviewBuffer(0), 1); // back = layer 1 loading seg 1
      s = ready(s, 1, 1);
      expect(s.front).toBe(1);
      expect(s.ready[1]).toBe(true);
    });

    it("records readiness of the front layer without swapping", () => {
      const s = ready(initialPreviewBuffer(0), 0, 0);
      expect(s.front).toBe(0);
      expect(s.ready[0]).toBe(true);
    });

    it("ignores a stale ready event superseded by a newer request", () => {
      // request 1, then request 2 on the same back layer; the ready for 1 is stale
      let s = requestIndex(initialPreviewBuffer(0), 1); // loaded = [0,1]
      s = requestIndex(s, 2); // loaded = [0,2]
      const afterStale = ready(s, 1, 1); // layer 1 now holds 2, not 1
      expect(afterStale.front).toBe(0); // no swap
      const afterReal = ready(s, 1, 2);
      expect(afterReal.front).toBe(1); // real event swaps
    });

    it("does not swap if the front already shows that index", () => {
      const s = ready(initialPreviewBuffer(2), 0, 2);
      expect(s.front).toBe(0);
    });
  });
});
