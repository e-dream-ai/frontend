import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  FlowKeyframe,
  FlowTransition,
  TransitionStatus,
} from "@/types/flow.types";
import type { VideoModel } from "@/types/studio.types";

const LOOP_KEYFRAME_ID = "__loop__";

/** Derive the display keyframes list, appending a synthetic loop frame when enabled. */
function buildKeyframesWithLoop(
  keyframes: FlowKeyframe[],
  loop: boolean,
): FlowKeyframe[] {
  if (!loop || keyframes.length < 2) return keyframes;
  const first = keyframes[0];
  return [
    ...keyframes,
    {
      id: LOOP_KEYFRAME_ID,
      keyframeUuid: first.keyframeUuid,
      imageUrl: first.imageUrl,
      name: first.name,
      isLoopKeyframe: true,
    },
  ];
}

type FlowStoreState = {
  // Phase 0
  keyframes: FlowKeyframe[];
  loop: boolean;
  addKeyframe: (keyframe: FlowKeyframe) => void;
  removeKeyframe: (id: string) => void;
  reorderKeyframes: (orderedIds: string[]) => void;
  setLoop: (loop: boolean) => void;
  keyframesWithLoop: () => FlowKeyframe[];
  resetFlow: () => void;

  // Phase 1 — global transition settings
  globalPresetId: string;
  globalPrompt: string;
  globalDuration: number;
  globalModel: VideoModel;
  globalNumInferenceSteps: number;
  globalGuidance: number;

  // Phase 1 — transitions
  transitions: FlowTransition[];

  // Phase 1 — UI state
  selectedTransitionIndex: number | null;
  settingsExpanded: boolean;

  // Phase 1 — actions
  setGlobalPreset: (id: string) => void;
  setGlobalPrompt: (prompt: string) => void;
  setGlobalDuration: (duration: number) => void;
  setGlobalModel: (model: VideoModel) => void;
  setGlobalNumInferenceSteps: (steps: number) => void;
  setGlobalGuidance: (guidance: number) => void;
  setTransitionOverride: (
    index: number,
    overrides: Partial<FlowTransition>,
  ) => void;
  clearTransitionOverride: (index: number) => void;
  selectTransition: (index: number | null) => void;
  setSettingsExpanded: (expanded: boolean) => void;
  updateTransitionStatus: (
    index: number,
    status: TransitionStatus,
    progress?: number,
  ) => void;
  setTransitionDream: (index: number, dreamUuid: string) => void;
  setTransitionUprez: (index: number, uprezDreamUuid: string) => void;
  updateTransitionUprezStatus: (
    index: number,
    status: "queue" | "processing" | "processed" | "failed",
    progress?: number,
  ) => void;
  recomputeTransitions: () => void;
  reconcileStaleTransitions: () => void;
};

const PHASE_1_DEFAULTS = {
  globalPresetId: "",
  globalPrompt: "",
  globalDuration: 5,
  globalModel: "wan-i2v" as VideoModel,
  globalNumInferenceSteps: 30,
  globalGuidance: 5.0,
  transitions: [] as FlowTransition[],
  selectedTransitionIndex: null as number | null,
  settingsExpanded: false,
};

/**
 * Build transitions from adjacent keyframe pairs.
 * Preserves existing transition state when pairs still match.
 */
function deriveTransitions(
  keyframesWithLoop: FlowKeyframe[],
  existing: FlowTransition[],
): FlowTransition[] {
  const pairs: Array<{ fromId: string; toId: string }> = [];
  for (let i = 0; i < keyframesWithLoop.length - 1; i++) {
    const from = keyframesWithLoop[i];
    const to = keyframesWithLoop[i + 1];
    // Use real keyframe IDs — map __loop__ back to the first keyframe's ID
    const fromId =
      from.id === LOOP_KEYFRAME_ID
        ? keyframesWithLoop[0]?.id ?? from.id
        : from.id;
    const toId =
      to.id === LOOP_KEYFRAME_ID ? keyframesWithLoop[0]?.id ?? to.id : to.id;
    pairs.push({ fromId, toId });
  }

  // Build index of existing transitions for O(1) lookup
  const existingMap = new Map<string, FlowTransition>();
  for (const t of existing) {
    existingMap.set(`${t.fromKeyframeId}:${t.toKeyframeId}`, t);
  }

  return pairs.map(({ fromId, toId }) => {
    const key = `${fromId}:${toId}`;
    const prev = existingMap.get(key);
    if (prev) return prev;
    return {
      fromKeyframeId: fromId,
      toKeyframeId: toId,
      status: "idle" as const,
    };
  });
}

export const useFlowStore = create<FlowStoreState>()(
  persist(
    (set, get) => ({
      // Phase 0 state
      keyframes: [],
      loop: false,

      addKeyframe: (keyframe) =>
        set((s) => ({ keyframes: [...s.keyframes, keyframe] })),

      removeKeyframe: (id) =>
        set((s) => ({
          keyframes: s.keyframes.filter((kf) => kf.id !== id),
        })),

      reorderKeyframes: (orderedIds) =>
        set((s) => {
          const map = new Map(s.keyframes.map((kf) => [kf.id, kf]));
          return {
            keyframes: orderedIds
              .map((id) => map.get(id))
              .filter(Boolean) as FlowKeyframe[],
          };
        }),

      setLoop: (loop) => set({ loop }),

      keyframesWithLoop: () => {
        const { keyframes, loop } = get();
        return buildKeyframesWithLoop(keyframes, loop);
      },

      resetFlow: () =>
        set({
          keyframes: [],
          loop: false,
          ...PHASE_1_DEFAULTS,
        }),

      // Phase 1 — global settings
      ...PHASE_1_DEFAULTS,
      setGlobalPreset: (id) => set({ globalPresetId: id }),
      setGlobalPrompt: (prompt) => set({ globalPrompt: prompt }),
      setGlobalDuration: (duration) => set({ globalDuration: duration }),
      setGlobalModel: (model) => set({ globalModel: model }),
      setGlobalNumInferenceSteps: (steps) =>
        set({ globalNumInferenceSteps: steps }),
      setGlobalGuidance: (guidance) => set({ globalGuidance: guidance }),

      // Phase 1 — transition actions
      setTransitionOverride: (index, overrides) =>
        set((s) => {
          const transitions = [...s.transitions];
          if (!transitions[index]) return s;
          transitions[index] = { ...transitions[index], ...overrides };
          return { transitions };
        }),

      clearTransitionOverride: (index) =>
        set((s) => {
          const transitions = [...s.transitions];
          if (!transitions[index]) return s;
          const t = transitions[index];
          transitions[index] = {
            fromKeyframeId: t.fromKeyframeId,
            toKeyframeId: t.toKeyframeId,
            status: t.status,
            progress: t.progress,
            dreamUuid: t.dreamUuid,
            uprezDreamUuid: t.uprezDreamUuid,
            uprezStatus: t.uprezStatus,
            uprezProgress: t.uprezProgress,
          };
          return { transitions };
        }),

      selectTransition: (index) => set({ selectedTransitionIndex: index }),
      setSettingsExpanded: (expanded) => set({ settingsExpanded: expanded }),

      updateTransitionStatus: (index, status, progress) =>
        set((s) => {
          const transitions = [...s.transitions];
          if (!transitions[index]) return s;
          transitions[index] = {
            ...transitions[index],
            status,
            progress: progress ?? undefined,
          };
          return { transitions };
        }),

      setTransitionDream: (index, dreamUuid) =>
        set((s) => {
          const transitions = [...s.transitions];
          if (!transitions[index]) return s;
          transitions[index] = { ...transitions[index], dreamUuid };
          return { transitions };
        }),

      setTransitionUprez: (index, uprezDreamUuid) =>
        set((s) => {
          const transitions = [...s.transitions];
          if (!transitions[index]) return s;
          transitions[index] = { ...transitions[index], uprezDreamUuid };
          return { transitions };
        }),

      updateTransitionUprezStatus: (index, status, progress) =>
        set((s) => {
          const transitions = [...s.transitions];
          if (!transitions[index]) return s;
          transitions[index] = {
            ...transitions[index],
            uprezStatus: status,
            uprezProgress: progress ?? undefined,
          };
          return { transitions };
        }),

      recomputeTransitions: () =>
        set((s) => ({
          transitions: deriveTransitions(
            buildKeyframesWithLoop(s.keyframes, s.loop),
            s.transitions,
          ),
        })),

      reconcileStaleTransitions: () =>
        set((s) => ({
          transitions: s.transitions.map((t) =>
            t.status === "processing" || t.status === "queue"
              ? { ...t, status: "failed" as const, progress: undefined }
              : t,
          ),
        })),
    }),
    {
      name: "flow-session",
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          return {
            ...state,
            ...PHASE_1_DEFAULTS,
          };
        }
        return state;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Order matters: reconcile must run first to mark stale in-flight
          // jobs as "failed" before recompute preserves them via the existing map.
          state.reconcileStaleTransitions();
          state.recomputeTransitions();
        }
      },
      partialize: (state) => ({
        keyframes: state.keyframes,
        loop: state.loop,
        transitions: state.transitions,
        globalPresetId: state.globalPresetId,
        globalPrompt: state.globalPrompt,
        globalDuration: state.globalDuration,
        globalModel: state.globalModel,
        globalNumInferenceSteps: state.globalNumInferenceSteps,
        globalGuidance: state.globalGuidance,
        selectedTransitionIndex: state.selectedTransitionIndex,
        settingsExpanded: state.settingsExpanded,
      }),
    },
  ),
);
