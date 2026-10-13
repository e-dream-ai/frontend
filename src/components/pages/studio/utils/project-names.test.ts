import { describe, expect, it } from "vitest";
import type { DeforumClip, DeforumSettings } from "@/types/deforum.types";
import type { FlowTransition, TransitionSettings } from "@/types/flow.types";
import type {
  StudioAction,
  StudioImage,
  StudioJob,
} from "@/types/studio.types";
import {
  firstActionPrompt,
  firstDeforumPrompt,
  firstFlowPrompt,
  nameFromPrompt,
} from "./project-names";

const settings = (prompt: string) => ({ prompt }) as TransitionSettings;

const transition = (
  history: [number, string][],
  extra: Partial<FlowTransition> = {},
): FlowTransition =>
  ({
    fromFrameId: "a",
    toFrameId: "b",
    status: "idle",
    settings: settings("current"),
    history: history.map(([createdAt, prompt]) => ({
      dreamUuid: `d${createdAt}`,
      createdAt,
      settings: settings(prompt),
    })),
    ...extra,
  }) as FlowTransition;

const deforumClip = (renders: {
  test?: [number, string];
  final?: [number, string];
}): DeforumClip => {
  const render = ([createdAt, text]: [number, string]) => ({
    dreamUuid: `d${createdAt}`,
    status: "processed" as const,
    createdAt,
    settings: {
      prompts: [{ id: "p", frame: 0, text }],
    } as DeforumSettings,
  });
  return {
    id: "c",
    name: "",
    settings: {} as DeforumSettings,
    test: renders.test && render(renders.test),
    final: renders.final && render(renders.final),
  };
};

describe("nameFromPrompt", () => {
  it("keeps the first few meaningful words", () => {
    expect(nameFromPrompt("A glowing horse walking across a field")).toBe(
      "glowing horse walking",
    );
  });

  it("drops LoRA tags", () => {
    expect(nameFromPrompt("<lora:ral-trichom:0.6> mantis priest")).toBe(
      "mantis priest",
    );
  });

  it("is empty with nothing to go on", () => {
    expect(nameFromPrompt(undefined)).toBe("");
    expect(nameFromPrompt("  ")).toBe("");
  });
});

describe("firstFlowPrompt", () => {
  it("takes the earliest run across every transition", () => {
    expect(
      firstFlowPrompt(
        [],
        [
          transition([[30, "later"]]),
          transition([
            [20, "earliest"],
            [40, "latest"],
          ]),
        ],
      ),
    ).toBe("earliest");
  });

  it("falls back to a rendered transition without history", () => {
    expect(
      firstFlowPrompt(
        [],
        [
          transition([]),
          transition([], { dreamUuid: "x", settings: settings("old") }),
        ],
      ),
    ).toBe("old");
  });

  it("prefers the first frame generated from a prompt", () => {
    expect(
      firstFlowPrompt(
        [undefined, "tiger in a jungle", "later"],
        [transition([[10, "transition"]])],
      ),
    ).toBe("tiger in a jungle");
  });

  it("has nothing before anything renders", () => {
    expect(firstFlowPrompt([], [transition([])])).toBeUndefined();
  });
});

describe("firstDeforumPrompt", () => {
  it("takes the earliest render, test or final", () => {
    expect(
      firstDeforumPrompt([
        deforumClip({ final: [30, "final one"] }),
        deforumClip({ test: [10, "tested first"], final: [40, "x"] }),
      ]),
    ).toBe("tested first");
  });

  it("has nothing before anything renders", () => {
    expect(firstDeforumPrompt([deforumClip({})])).toBeUndefined();
  });
});

describe("firstActionPrompt", () => {
  const image = (prompt?: string) => ({ uuid: "i", prompt }) as StudioImage;
  const action = (id: string, prompt: string) =>
    ({ id, prompt }) as StudioAction;
  const job = (actionId: string, startedAt?: number) =>
    ({ actionId, startedAt }) as StudioJob;

  it("prefers the first generated image's prompt", () => {
    expect(
      firstActionPrompt(
        [image(), image("disco merkaba"), image("later")],
        [action("a", "zoom in")],
        [job("a", 1)],
      ),
    ).toBe("disco merkaba");
  });

  it("uses the earliest clip's action when every image was uploaded", () => {
    expect(
      firstActionPrompt(
        [image()],
        [action("a", "spin"), action("b", "zoom in")],
        [job("a", 20), job("b", 10)],
      ),
    ).toBe("zoom in");
  });

  it("has nothing before anything is generated", () => {
    expect(firstActionPrompt([image()], [action("a", "x")], [])).toBe(
      undefined,
    );
  });
});
