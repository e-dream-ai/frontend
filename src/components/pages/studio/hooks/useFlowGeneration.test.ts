import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const invalidateQueries = vi.fn();
  const post = vi.fn();
  const ensureFlowKeyframe = vi.fn(
    async (frame: { id: string }) => `frame-${frame.id}`,
  );
  const recordTransitionRun = vi.fn();
  const updateTransitionStatus = vi.fn();
  const store = {
    transitions: [
      {
        fromFrameId: "frame-1",
        toFrameId: "frame-2",
        status: "idle",
      },
      {
        fromFrameId: "frame-2",
        toFrameId: "frame-3",
        status: "idle",
      },
    ],
    referenceFrames: [
      { id: "frame-1", dreamUuid: "dream-1", name: "One" },
      { id: "frame-2", dreamUuid: "dream-2", name: "Two" },
      { id: "frame-3", dreamUuid: "dream-3", name: "Three" },
    ],
    globalPresetId: "",
    globalPrompt: "move",
    globalNegativePrompt: "",
    globalDuration: 5,
    globalModel: "ltx-i2v",
    globalNumInferenceSteps: 20,
    globalGuidance: 3,
    globalLora: undefined,
  };
  return {
    invalidateQueries,
    post,
    ensureFlowKeyframe,
    recordTransitionRun,
    updateTransitionStatus,
    store,
  };
});

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useCallback: <T>(callback: T) => callback,
    useRef: <T>(value: T) => ({ current: value }),
    useState: <T>(value: T) => [value, vi.fn()],
  };
});

vi.mock("../../../../api/query-client", () => ({
  default: { invalidateQueries: mocks.invalidateQueries },
}));

vi.mock("../../../../api/user/query/useUser", () => ({
  USER_QUERY_KEY: "getUser",
}));

vi.mock("../../../../client/axios.client", () => ({
  axiosClient: { post: mocks.post, put: vi.fn() },
}));

vi.mock("../../../../stores/flow.store", () => ({
  useFlowStore: Object.assign(
    (
      selector: (
        state: typeof mocks.store & {
          recordTransitionRun: typeof mocks.recordTransitionRun;
          updateTransitionStatus: typeof mocks.updateTransitionStatus;
        },
      ) => unknown,
    ) =>
      selector({
        ...mocks.store,
        recordTransitionRun: mocks.recordTransitionRun,
        updateTransitionStatus: mocks.updateTransitionStatus,
      }),
    { getState: () => mocks.store },
  ),
}));

vi.mock("../utils/build-video-algo-params", () => ({
  buildVideoAlgoParams: () => ({ infinidream_algorithm: "ltx-i2v" }),
}));

vi.mock("../utils/resolve-flow-settings", () => ({
  resolveEffectiveSettings: () => ({
    presetId: "",
    prompt: "move",
    model: "ltx-i2v",
    action: { prompt: "move", highNoiseLoras: [], lowNoiseLoras: [] },
    duration: 5,
    numInferenceSteps: 20,
    guidance: 3,
    seed: -1,
    negativePrompt: "",
  }),
}));

vi.mock("../utils/flow-keyframes", () => ({
  ensureFlowKeyframe: mocks.ensureFlowKeyframe,
}));

import { useFlowGeneration } from "./useFlowGeneration";

describe("useFlowGeneration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore the default same-shape frames; individual tests reshape them.
    mocks.store.referenceFrames = [
      { id: "frame-1", dreamUuid: "dream-1", name: "One" },
      { id: "frame-2", dreamUuid: "dream-2", name: "Two" },
      { id: "frame-3", dreamUuid: "dream-3", name: "Three" },
    ];
    mocks.post
      .mockResolvedValueOnce({ data: { data: { dream: { uuid: "new-1" } } } })
      .mockResolvedValueOnce({ data: { data: { dream: { uuid: "new-2" } } } });
  });

  it("refreshes daily credits after Generate All finishes", async () => {
    const { generateAll } = useFlowGeneration();

    await generateAll();

    expect(mocks.post).toHaveBeenCalledTimes(2);
    expect(mocks.invalidateQueries).toHaveBeenCalledWith(["getUser"]);
    // Nothing was rolled back to "failed" — the happy path really ran.
    expect(mocks.updateTransitionStatus).not.toHaveBeenCalledWith(
      expect.anything(),
      "failed",
    );
  });

  it("records each run with the settings it used, for the history strip", async () => {
    const { generateAll } = useFlowGeneration();

    await generateAll();

    expect(mocks.recordTransitionRun).toHaveBeenCalledTimes(2);
    const [index, dreamUuid, settings, createdAt] =
      mocks.recordTransitionRun.mock.calls[0];
    expect(index).toBe(0);
    expect(dreamUuid).toBe("new-1");
    expect(settings).toMatchObject({
      promptOverride: "move",
      modelOverride: "ltx-i2v",
      durationOverride: 5,
      numInferenceStepsOverride: 20,
      guidanceOverride: 3,
      seedOverride: -1,
      loraOverride: [],
    });
    expect(typeof createdAt).toBe("number");
  });

  it("regenerates an explicit selection, processed ones included", async () => {
    // Generate All skips these; asking for a rerun of what you picked must not.
    mocks.store.transitions = [
      { fromFrameId: "frame-1", toFrameId: "frame-2", status: "processed" },
      { fromFrameId: "frame-2", toFrameId: "frame-3", status: "processed" },
    ];

    const { generateMany } = useFlowGeneration();
    await generateMany([1]);

    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(mocks.recordTransitionRun).toHaveBeenCalledWith(
      1,
      "new-1",
      expect.anything(),
      expect.any(Number),
    );

    mocks.store.transitions = [
      { fromFrameId: "frame-1", toFrameId: "frame-2", status: "idle" },
      { fromFrameId: "frame-2", toFrameId: "frame-3", status: "idle" },
    ];
  });

  it("skips a transition whose two frames have different aspect ratios", async () => {
    // frame-3 is portrait, so frame-2 → frame-3 cannot be rendered.
    mocks.store.referenceFrames = [
      {
        id: "frame-1",
        dreamUuid: "dream-1",
        name: "One",
        naturalWidth: 1280,
        naturalHeight: 720,
      },
      {
        id: "frame-2",
        dreamUuid: "dream-2",
        name: "Two",
        naturalWidth: 1920,
        naturalHeight: 1080,
      },
      {
        id: "frame-3",
        dreamUuid: "dream-3",
        name: "Three",
        naturalWidth: 720,
        naturalHeight: 1280,
      },
    ];

    const { generateAll } = useFlowGeneration();
    await generateAll();

    // Only frame-1 → frame-2 is generated; the differing resolutions there are
    // the same 16:9 shape and must not be treated as a mismatch.
    expect(mocks.post).toHaveBeenCalledTimes(1);
  });

  it("generates every transition when all frames share a shape", async () => {
    mocks.store.referenceFrames = [
      {
        id: "frame-1",
        dreamUuid: "dream-1",
        name: "One",
        naturalWidth: 1024,
        naturalHeight: 1024,
      },
      {
        id: "frame-2",
        dreamUuid: "dream-2",
        name: "Two",
        naturalWidth: 512,
        naturalHeight: 512,
      },
      {
        id: "frame-3",
        dreamUuid: "dream-3",
        name: "Three",
        naturalWidth: 768,
        naturalHeight: 768,
      },
    ];

    const { generateAll } = useFlowGeneration();
    await generateAll();

    expect(mocks.post).toHaveBeenCalledTimes(2);
  });
});
