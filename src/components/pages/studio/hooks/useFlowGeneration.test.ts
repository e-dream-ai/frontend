import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const invalidateQueries = vi.fn();
  const post = vi.fn();
  const ensureFlowKeyframe = vi.fn(
    async (keyframe: { id: string }) => `keyframe-${keyframe.id}`,
  );
  const setTransitionDream = vi.fn();
  const updateTransitionStatus = vi.fn();
  const updateKeyframe = vi.fn();
  const uploadImage = vi.fn();
  const buildVideoAlgoParams = vi.fn(() => ({
    infinidream_algorithm: "ltx-i2v",
  }));
  const cropImageToFile = vi.fn(async () => ({ name: "crop.jpg" }));
  const loadImageDimensions = vi.fn(async () => ({
    width: 1080,
    height: 1920,
  }));
  const store = {
    globalAspectRatio: "auto",
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
  };
  return {
    invalidateQueries,
    post,
    ensureFlowKeyframe,
    setTransitionDream,
    updateTransitionStatus,
    updateKeyframe,
    uploadImage,
    buildVideoAlgoParams,
    cropImageToFile,
    loadImageDimensions,
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
          updateKeyframe: typeof mocks.updateKeyframe;
        },
      ) => unknown,
    ) =>
      selector({
        ...mocks.store,
        setTransitionDream: mocks.setTransitionDream,
        updateTransitionStatus: mocks.updateTransitionStatus,
        updateKeyframe: mocks.updateKeyframe,
      }),
    { getState: () => mocks.store },
  ),
}));

vi.mock("../../../../api/dream/mutation/useUploadImageDream", () => ({
  useUploadImageDream: () => ({ mutateAsync: mocks.uploadImage }),
}));

vi.mock("../utils/build-video-algo-params", () => ({
  buildVideoAlgoParams: mocks.buildVideoAlgoParams,
}));

vi.mock("../../../../utils/crop-image", () => ({
  cropImageToFile: mocks.cropImageToFile,
  loadImageDimensions: mocks.loadImageDimensions,
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

  it("crops portrait keyframes to the output ratio and feeds the cropped Dream to generation", async () => {
    // Override the shared store: portrait frames + a landscape output override.
    const prevKeyframes = mocks.store.keyframes;
    const prevRatio = mocks.store.globalAspectRatio;
    const prevTransitions = mocks.store.transitions;
    mocks.store.globalAspectRatio = "16:9";
    mocks.store.keyframes = [
      {
        id: "frame-1",
        dreamUuid: "dream-1",
        name: "One",
        imageUrl: "https://cdn.example.com/1.jpg",
        naturalWidth: 1080,
        naturalHeight: 1920,
      },
      {
        id: "frame-2",
        dreamUuid: "dream-2",
        name: "Two",
        imageUrl: "https://cdn.example.com/2.jpg",
        naturalWidth: 1080,
        naturalHeight: 1920,
      },
    ];
    mocks.store.transitions = [
      { fromKeyframeId: "frame-1", toKeyframeId: "frame-2", status: "idle" },
    ];
    mocks.uploadImage
      .mockResolvedValueOnce({ dreamUuid: "cropped-1" })
      .mockResolvedValueOnce({ dreamUuid: "cropped-2" });

    try {
      const { generateOne } = useFlowGeneration();
      await generateOne(0);

      // Both frames were cropped and re-uploaded.
      expect(mocks.cropImageToFile).toHaveBeenCalledTimes(2);
      expect(mocks.uploadImage).toHaveBeenCalledTimes(2);
      // The cache was written with the new cropped Dream UUID.
      expect(mocks.updateKeyframe).toHaveBeenCalledWith(
        "frame-1",
        expect.objectContaining({ croppedDreamUuid: "cropped-1" }),
      );
      // Generation used the cropped Dreams, not the originals.
      const call = mocks.buildVideoAlgoParams.mock.calls[0][0];
      expect(call.imageUuid).toBe("cropped-1");
      expect(call.endImageUuid).toBe("cropped-2");
      expect(call.imageSize).toBe("1280*720");
    } finally {
      mocks.store.keyframes = prevKeyframes;
      mocks.store.globalAspectRatio = prevRatio;
      mocks.store.transitions = prevTransitions;
    }
  });
});
