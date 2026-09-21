import { describe, it, expect } from "vitest";
import {
  fromPersistedActionState,
  fromPersistedFlowState,
  toPersistedActionState,
  toPersistedFlowState,
} from "./editor-project-state";
import type { FlowReferenceFrame, FlowTransition } from "@/types/flow.types";

const frame = (id: string): FlowReferenceFrame => ({
  id,
  dreamUuid: `dream-${id}`,
  imageUrl: `https://r2.example/${id}?X-Amz-Expires=1800`,
  name: id,
  uploadStatus: "uploading",
  uploadProgress: 42,
});

const transition = (
  fromFrameId: string,
  toFrameId: string,
  over: Partial<FlowTransition> = {},
): FlowTransition => ({
  fromFrameId,
  toFrameId,
  status: "processed",
  progress: 100,
  ...over,
});

describe("flow state persistence", () => {
  it("drops expiring urls and transient upload state from frames", () => {
    const persisted = toPersistedFlowState({
      referenceFrames: [frame("a")],
      transitions: [],
    });

    expect(persisted.referenceFrames[0]).not.toHaveProperty("imageUrl");
    expect(persisted.referenceFrames[0]).not.toHaveProperty("uploadStatus");
    expect(persisted.referenceFrames[0]).not.toHaveProperty("uploadProgress");
    expect(persisted.referenceFrames[0].dreamUuid).toBe("dream-a");
  });

  it("keys transitions by frame pair so inserting a frame does not shift them", () => {
    const persisted = toPersistedFlowState({
      referenceFrames: [frame("a"), frame("b")],
      transitions: [transition("a", "b", { dreamUuid: "d1" })],
    });

    const restored = fromPersistedFlowState({
      ...persisted,
      referenceFrames: [
        persisted.referenceFrames[0],
        { id: "new", name: "new" },
        persisted.referenceFrames[1],
      ],
    });

    expect(restored.transitions).toHaveLength(2);
    expect(restored.transitions[0]).toMatchObject({
      fromFrameId: "a",
      toFrameId: "new",
      status: "idle",
    });
    expect(restored.transitions[1]).toMatchObject({
      fromFrameId: "new",
      toFrameId: "b",
      status: "idle",
    });
  });

  it("round trips an unchanged flow back to the same ordered transitions", () => {
    const original = {
      referenceFrames: [frame("a"), frame("b"), frame("c")],
      transitions: [
        transition("a", "b", { dreamUuid: "d1" }),
        transition("b", "c", { dreamUuid: "d2" }),
      ],
      savedPlaylistUuid: "keep me",
    };

    const restored = fromPersistedFlowState(toPersistedFlowState(original));

    expect(restored.transitions.map((t) => t.dreamUuid)).toEqual(["d1", "d2"]);
    expect(restored.savedPlaylistUuid).toBe("keep me");
  });

  it("gives every restored transition settings, including unstored gaps", () => {
    const persisted = toPersistedFlowState({
      referenceFrames: [frame("a"), frame("b")],
      transitions: [],
    });

    const restored = fromPersistedFlowState(persisted);

    expect(restored.transitions).toHaveLength(1);
    expect(restored.transitions[0].settings).toBeDefined();
  });
});

describe("action state persistence", () => {
  it("converts excludedCombos between Set and array", () => {
    const persisted = toPersistedActionState({
      excludedCombos: new Set(["x", "y"]),
    });

    expect(persisted.excludedCombos).toEqual(["x", "y"]);
    expect(fromPersistedActionState(persisted).excludedCombos).toBeInstanceOf(
      Set,
    );
  });

  it("drops expiring image urls and preview frames", () => {
    const persisted = toPersistedActionState({
      images: [
        {
          uuid: "i1",
          url: "https://r2.example/i1?X-Amz-Expires=1800",
          name: "i1",
          status: "processed",
          previewFrame: "data:image/png;base64,zzz",
        },
      ],
      excludedCombos: new Set(),
    });

    expect(persisted.images[0]).not.toHaveProperty("url");
    expect(persisted.images[0]).not.toHaveProperty("previewFrame");
    expect(persisted.images[0].uuid).toBe("i1");
  });
});
