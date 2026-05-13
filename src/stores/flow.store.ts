import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FlowKeyframe } from "@/types/flow.types";

const LOOP_KEYFRAME_ID = "__loop__";

type FlowStoreState = {
  keyframes: FlowKeyframe[];
  loop: boolean;

  addKeyframe: (keyframe: FlowKeyframe) => void;
  removeKeyframe: (id: string) => void;
  reorderKeyframes: (orderedIds: string[]) => void;
  setLoop: (loop: boolean) => void;
  keyframesWithLoop: () => FlowKeyframe[];
  resetFlow: () => void;
};

const initialState = {
  keyframes: [] as FlowKeyframe[],
  loop: false,
};

export const useFlowStore = create<FlowStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addKeyframe: (keyframe) =>
        set((state) => ({
          keyframes: [...state.keyframes, keyframe],
        })),

      removeKeyframe: (id) =>
        set((state) => ({
          keyframes: state.keyframes.filter(
            (kf) => kf.id !== id || kf.isLoopKeyframe,
          ),
        })),

      reorderKeyframes: (orderedIds) =>
        set((state) => {
          const byId = new Map(state.keyframes.map((kf) => [kf.id, kf]));
          const reordered = orderedIds
            .map((id) => byId.get(id))
            .filter(Boolean) as FlowKeyframe[];
          return { keyframes: reordered };
        }),

      setLoop: (loop) => set({ loop }),

      keyframesWithLoop: () => {
        const { keyframes, loop } = get();
        if (!loop || keyframes.length < 2) return [...keyframes];
        const first = keyframes[0];
        const loopKf: FlowKeyframe = {
          id: LOOP_KEYFRAME_ID,
          keyframeUuid: first.keyframeUuid,
          imageUrl: first.imageUrl,
          name: first.name,
          isLoopKeyframe: true,
        };
        return [...keyframes, loopKf];
      },

      resetFlow: () => set(initialState),
    }),
    {
      name: "flow-session",
      version: 1,
    },
  ),
);
