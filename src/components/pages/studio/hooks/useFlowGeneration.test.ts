import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const invalidateQueries = vi.fn();
  const post = vi.fn();
  const ensureFlowKeyframe = vi.fn(
    async (keyframe: { id: string }) => `keyframe-${keyframe.id}`,
  );
  const setTransitionDream = vi.fn();
  const updateTransitionStatus = vi.fn();
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
  };
  return {
    invalidateQueries,
    post,
    ensureFlowKeyframe,
    setTransitionDream,
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
  buildVideoAlgoParams: () => ({ infinidream_algorithm: "ltx-i2v" }),
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
});
