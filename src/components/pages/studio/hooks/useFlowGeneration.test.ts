import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const invalidateQueries = vi.fn();
  const post = vi.fn();
  const ensureFlowKeyframe = vi.fn(
    async (keyframe: { id: string }) => `keyframe-${keyframe.id}`,
  );
  const setTransitionDream = vi.fn();
  const updateTransitionStatus = vi.fn();
  const buildVideoAlgoParams = vi.fn(() => ({
    infinidream_algorithm: "ltx-i2v",
  }));
  const waitForRenderedClip = vi.fn(async () => true);
  const store = {
    transitions: [
      {
        fromKeyframeId: "frame-1",
        toKeyframeId: "frame-2",
        status: "idle",
      },
      {
        fromKeyframeId: "frame-2",
        toKeyframeId: "frame-3",
        status: "idle",
      },
    ],
    keyframes: [
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
    seamlessChaining: false,
  };
  return {
    invalidateQueries,
    post,
    ensureFlowKeyframe,
    setTransitionDream,
    updateTransitionStatus,
    buildVideoAlgoParams,
    waitForRenderedClip,
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
          setTransitionDream: typeof mocks.setTransitionDream;
          updateTransitionStatus: typeof mocks.updateTransitionStatus;
        },
      ) => unknown,
    ) =>
      selector({
        ...mocks.store,
        setTransitionDream: mocks.setTransitionDream,
        updateTransitionStatus: mocks.updateTransitionStatus,
      }),
    { getState: () => mocks.store },
  ),
}));

vi.mock("../utils/build-video-algo-params", () => ({
  buildVideoAlgoParams: mocks.buildVideoAlgoParams,
}));

vi.mock("../utils/wait-for-rendered-clip", () => ({
  waitForRenderedClip: mocks.waitForRenderedClip,
}));

vi.mock("../utils/resolve-flow-settings", () => ({
  resolveEffectiveSettings: () => ({
    model: "ltx-i2v",
    action: undefined,
    duration: 5,
    numInferenceSteps: 20,
    guidance: 3,
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
    mocks.buildVideoAlgoParams.mockReturnValue({
      infinidream_algorithm: "ltx-i2v",
    });
    mocks.waitForRenderedClip.mockResolvedValue(true);
    mocks.store.seamlessChaining = false;
    mocks.store.transitions = [
      { fromKeyframeId: "frame-1", toKeyframeId: "frame-2", status: "idle" },
      { fromKeyframeId: "frame-2", toKeyframeId: "frame-3", status: "idle" },
    ];
    // Restore the default same-shape frames; individual tests reshape them.
    mocks.store.keyframes = [
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
  });

  it("skips a transition whose two frames have different aspect ratios", async () => {
    // frame-3 is portrait, so frame-2 → frame-3 cannot be rendered.
    mocks.store.keyframes = [
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
    mocks.store.keyframes = [
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

describe("useFlowGeneration — seamless chaining", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.buildVideoAlgoParams.mockReturnValue({
      infinidream_algorithm: "ltx-i2v",
    });
    mocks.waitForRenderedClip.mockResolvedValue(true);
    mocks.store.seamlessChaining = true;
    mocks.store.keyframes = [
      { id: "frame-1", dreamUuid: "dream-1", name: "One" },
      { id: "frame-2", dreamUuid: "dream-2", name: "Two" },
      { id: "frame-3", dreamUuid: "dream-3", name: "Three" },
    ];
    // Clip 1 has already rendered, so clip 2 can open on its final frame.
    mocks.store.transitions = [
      {
        fromKeyframeId: "frame-1",
        toKeyframeId: "frame-2",
        status: "processed",
        dreamUuid: "clip-1",
      },
      { fromKeyframeId: "frame-2", toKeyframeId: "frame-3", status: "idle" },
    ];
    mocks.post.mockResolvedValue({
      data: { data: { dream: { uuid: "new-2" } } },
    });
  });

  const sourceOfLastCall = () =>
    mocks.buildVideoAlgoParams.mock.calls.at(-1)?.[0] as unknown as {
      imageUuid: string;
      endImageUuid: string;
    };

  it("opens the next clip on the previous clip's rendered final frame", async () => {
    const { generateAll } = useFlowGeneration();

    await generateAll();

    expect(mocks.waitForRenderedClip).toHaveBeenCalledWith("clip-1");
    // The video dream, not the shared keyframe: the worker resolves it to the
    // clip's last frame, which is what the previous clip actually ends on.
    expect(sourceOfLastCall().imageUuid).toBe("clip-1");
    // The tail is still the flow's own keyframe — only the seam changes.
    expect(sourceOfLastCall().endImageUuid).toBe("dream-3");
  });

  it("falls back to the keyframe when the previous clip never rendered", async () => {
    mocks.waitForRenderedClip.mockResolvedValue(false);

    const { generateAll } = useFlowGeneration();
    await generateAll();

    expect(sourceOfLastCall().imageUuid).toBe("dream-2");
  });

  it("does not chain across a gap where the clips share no keyframe", async () => {
    mocks.store.transitions = [
      {
        fromKeyframeId: "frame-1",
        toKeyframeId: "frame-1",
        status: "processed",
        dreamUuid: "clip-1",
      },
      { fromKeyframeId: "frame-2", toKeyframeId: "frame-3", status: "idle" },
    ];

    const { generateAll } = useFlowGeneration();
    await generateAll();

    expect(mocks.waitForRenderedClip).not.toHaveBeenCalled();
    expect(sourceOfLastCall().imageUuid).toBe("dream-2");
  });

  it("keeps the keyframe as the source when chaining is off", async () => {
    mocks.store.seamlessChaining = false;

    const { generateAll } = useFlowGeneration();
    await generateAll();

    expect(mocks.waitForRenderedClip).not.toHaveBeenCalled();
    expect(sourceOfLastCall().imageUuid).toBe("dream-2");
  });
});
