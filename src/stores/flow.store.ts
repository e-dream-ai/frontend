import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  FlowKeyframe,
  FlowTransition,
  TransitionStatus,
} from "@/types/flow.types";
import type { VideoModel, LoRAConfig } from "@/types/studio.types";
import {
  type AspectRatioSetting,
  type CropRegion,
  type Dimensions,
  defaultCenterCrop,
  parseAspectRatio,
} from "@/utils/aspect-crop";

export const LOOP_KEYFRAME_ID = "__loop__";

/** Dimensions of the first keyframe (in order) that has loaded pixel dims. */
function firstKeyframeDims(keyframes: FlowKeyframe[]): Dimensions | undefined {
  const kf = keyframes.find((k) => k.naturalWidth && k.naturalHeight);
  return kf ? { width: kf.naturalWidth!, height: kf.naturalHeight! } : undefined;
}

/**
 * Re-fit every keyframe's crop to a fresh center crop for the given output
 * ratio. Keyframes without loaded dimensions are left untouched (their crop is
 * computed lazily when the image loads). Changing the crop invalidates any
 * cached cropped-and-reuploaded Dream, so clear that cache too.
 */
function refitKeyframeCrops(
  keyframes: FlowKeyframe[],
  setting: AspectRatioSetting,
): FlowKeyframe[] {
  const ratio = parseAspectRatio(setting, firstKeyframeDims(keyframes));
  return keyframes.map((kf) => {
    if (!kf.naturalWidth || !kf.naturalHeight) return kf;
    return {
      ...kf,
      crop: defaultCenterCrop(kf.naturalWidth, kf.naturalHeight, ratio),
      croppedDreamUuid: undefined,
      croppedSignature: undefined,
    };
  });
}

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
      dreamUuid: first.dreamUuid,
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
  updateKeyframe: (id: string, patch: Partial<FlowKeyframe>) => void;
  removeKeyframe: (id: string) => void;
  reorderKeyframes: (orderedIds: string[]) => void;
  setLoop: (loop: boolean) => void;
  keyframesWithLoop: () => FlowKeyframe[];
  resetFlow: () => void;

  // Aspect ratio / crop (#668)
  globalAspectRatio: AspectRatioSetting;
  setGlobalAspectRatio: (ratio: AspectRatioSetting) => void;
  // Record a keyframe's source pixel dimensions and seed a default center crop.
  setKeyframeDimensions: (id: string, width: number, height: number) => void;
  // Persist a user-selected crop (from the crop editor) and invalidate its cache.
  setKeyframeCrop: (id: string, crop: CropRegion) => void;

  // Phase 1 — global transition settings
  globalPresetId: string;
  globalPrompt: string;
  globalNegativePrompt: string;
  globalDuration: number;
  globalModel: VideoModel;
  globalNumInferenceSteps: number;
  globalGuidance: number;
  globalLora: LoRAConfig[] | undefined;

  // Phase 1 — transitions
  transitions: FlowTransition[];

  // Phase 1 — UI state
  selectedTransitionIndex: number | null;
  settingsExpanded: boolean;
  previewLightboxOpen: boolean;

  // Phase 1 — actions
  setGlobalPreset: (id: string) => void;
  setGlobalPrompt: (prompt: string) => void;
  setGlobalNegativePrompt: (prompt: string) => void;
  setGlobalDuration: (duration: number) => void;
  setGlobalModel: (model: VideoModel) => void;
  setGlobalNumInferenceSteps: (steps: number) => void;
  setGlobalGuidance: (guidance: number) => void;
  setGlobalLora: (lora: LoRAConfig[] | undefined) => void;
  setTransitionOverride: (
    index: number,
    overrides: Partial<FlowTransition>,
  ) => void;
  clearTransitionOverride: (index: number) => void;
  selectTransition: (index: number | null) => void;
  setSettingsExpanded: (expanded: boolean) => void;
  setPreviewLightboxOpen: (open: boolean) => void;
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

  savedPlaylistUuid: string | null;
  syncedPlaylistDreamUuids: string[];
  linkSavedPlaylist: (uuid: string, syncedDreamUuids: string[]) => void;
  setPlaylistDreamsSynced: (dreamUuids: string[]) => void;
};

const PHASE_1_DEFAULTS = {
  globalAspectRatio: "auto" as AspectRatioSetting,
  globalPresetId: "Abstract",
  globalPrompt: "",
  globalNegativePrompt: "",
  globalDuration: 5,
  globalModel: "kling-25-i2v" as VideoModel,
  globalNumInferenceSteps: 30,
  globalGuidance: 5.0,
  globalLora: undefined as LoRAConfig[] | undefined,
  transitions: [] as FlowTransition[],
  selectedTransitionIndex: null as number | null,
  settingsExpanded: false,
  previewLightboxOpen: false,
  savedPlaylistUuid: null as string | null,
  syncedPlaylistDreamUuids: [] as string[],
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

export const flowPartialize = (state: FlowStoreState) => ({
  keyframes: state.keyframes
    .filter((kf) => (kf.keyframeUuid || kf.dreamUuid) && !kf.uploadStatus)
    .map((kf) => ({
      id: kf.id,
      keyframeUuid: kf.keyframeUuid,
      dreamUuid: kf.dreamUuid,
      imageUrl: kf.imageUrl,
      name: kf.name,
      isLoopKeyframe: kf.isLoopKeyframe,
      naturalWidth: kf.naturalWidth,
      naturalHeight: kf.naturalHeight,
      crop: kf.crop,
      croppedDreamUuid: kf.croppedDreamUuid,
      croppedSignature: kf.croppedSignature,
    })),
  loop: state.loop,
  globalAspectRatio: state.globalAspectRatio,
  transitions: state.transitions,
  savedPlaylistUuid: state.savedPlaylistUuid,
  syncedPlaylistDreamUuids: state.syncedPlaylistDreamUuids,
  globalPresetId: state.globalPresetId,
  globalPrompt: state.globalPrompt,
  globalNegativePrompt: state.globalNegativePrompt,
  globalDuration: state.globalDuration,
  globalModel: state.globalModel,
  globalNumInferenceSteps: state.globalNumInferenceSteps,
  globalGuidance: state.globalGuidance,
  globalLora: state.globalLora,
});

export const useFlowStore = create<FlowStoreState>()(
  persist(
    (set, get) => ({
      // Phase 0 state
      keyframes: [],
      loop: false,

      addKeyframe: (keyframe) =>
        set((s) => {
          const keyframes = [...s.keyframes, keyframe];
          return {
            keyframes,
            transitions: deriveTransitions(
              buildKeyframesWithLoop(keyframes, s.loop),
              s.transitions,
            ),
          };
        }),

      updateKeyframe: (id, patch) =>
        set((s) => ({
          keyframes: s.keyframes.map((kf) =>
            kf.id === id ? { ...kf, ...patch } : kf,
          ),
        })),

      removeKeyframe: (id) =>
        set((s) => {
          const keyframes = s.keyframes.filter((kf) => kf.id !== id);
          return {
            keyframes,
            transitions: deriveTransitions(
              buildKeyframesWithLoop(keyframes, s.loop),
              s.transitions,
            ),
          };
        }),

      reorderKeyframes: (orderedIds) =>
        set((s) => {
          const map = new Map(s.keyframes.map((kf) => [kf.id, kf]));
          const keyframes = orderedIds
            .map((id) => map.get(id))
            .filter((kf): kf is FlowKeyframe => kf !== undefined);
          return {
            keyframes,
            transitions: deriveTransitions(
              buildKeyframesWithLoop(keyframes, s.loop),
              s.transitions,
            ),
          };
        }),

      setLoop: (loop) =>
        set((s) => ({
          loop,
          transitions: deriveTransitions(
            buildKeyframesWithLoop(s.keyframes, loop),
            s.transitions,
          ),
        })),

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
      setGlobalNegativePrompt: (prompt) =>
        set({ globalNegativePrompt: prompt }),
      setGlobalDuration: (duration) => set({ globalDuration: duration }),
      setGlobalModel: (model) => set({ globalModel: model }),
      setGlobalNumInferenceSteps: (steps) =>
        set({ globalNumInferenceSteps: steps }),
      setGlobalGuidance: (guidance) => set({ globalGuidance: guidance }),
      setGlobalLora: (lora) => set({ globalLora: lora }),

      setGlobalAspectRatio: (ratio) =>
        set((s) => ({
          globalAspectRatio: ratio,
          // Re-derive dependent state (crops) in the same set() — a ratio
          // change means every crop must re-fit to the new output shape.
          keyframes: refitKeyframeCrops(s.keyframes, ratio),
        })),

      setKeyframeDimensions: (id, width, height) =>
        set((s) => {
          const ratio = parseAspectRatio(
            s.globalAspectRatio,
            firstKeyframeDims(s.keyframes) ?? { width, height },
          );
          return {
            keyframes: s.keyframes.map((kf) => {
              if (kf.id !== id) return kf;
              const next: FlowKeyframe = {
                ...kf,
                naturalWidth: width,
                naturalHeight: height,
              };
              if (!next.crop) {
                next.crop = defaultCenterCrop(width, height, ratio);
              }
              return next;
            }),
          };
        }),

      setKeyframeCrop: (id, crop) =>
        set((s) => ({
          keyframes: s.keyframes.map((kf) =>
            kf.id === id
              ? {
                  ...kf,
                  crop,
                  croppedDreamUuid: undefined,
                  croppedSignature: undefined,
                }
              : kf,
          ),
        })),

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
      setPreviewLightboxOpen: (open) => set({ previewLightboxOpen: open }),

      updateTransitionStatus: (index, status, progress) =>
        set((s) => {
          const transitions = [...s.transitions];
          if (!transitions[index]) return s;
          transitions[index] = {
            ...transitions[index],
            status,
            progress,
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
            uprezProgress: progress,
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
          transitions: s.transitions.map((t) => {
            const dreamStale =
              (t.status === "processing" || t.status === "queue") &&
              !t.dreamUuid;
            const uprezStale =
              (t.uprezStatus === "processing" || t.uprezStatus === "queue") &&
              !t.uprezDreamUuid;
            if (!dreamStale && !uprezStale) return t;
            return {
              ...t,
              ...(dreamStale && {
                status: "failed" as const,
                progress: undefined,
              }),
              ...(uprezStale && {
                uprezStatus: "failed" as const,
                uprezProgress: undefined,
              }),
            };
          }),
        })),

      linkSavedPlaylist: (uuid, syncedDreamUuids) =>
        set({
          savedPlaylistUuid: uuid,
          syncedPlaylistDreamUuids: Array.from(new Set(syncedDreamUuids)),
        }),

      setPlaylistDreamsSynced: (dreamUuids) =>
        set({
          syncedPlaylistDreamUuids: Array.from(new Set(dreamUuids)),
        }),
    }),
    {
      name: "flow-session",
      version: 5,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version < 2) {
          return {
            ...state,
            ...PHASE_1_DEFAULTS,
          };
        }
        if (version < 3) {
          // Negative prompt added; force LTX since it's the only working model.
          return {
            ...state,
            globalNegativePrompt: "",
            globalModel: "ltx-i2v",
          };
        }
        if (version < 4) {
          return {
            ...state,
            globalModel: "kling-25-i2v",
            globalDuration: 5,
          };
        }
        if (version < 5) {
          // Aspect-ratio crop feature (#668): default to auto; crops recompute
          // lazily as keyframe images load.
          return {
            ...state,
            globalAspectRatio: "auto",
          };
        }
        return state;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.reconcileStaleTransitions();
        state.recomputeTransitions();
        const idx = state.selectedTransitionIndex;
        if (idx !== null && (idx < 0 || idx >= state.transitions.length)) {
          state.selectTransition(null);
        }
      },
      partialize: flowPartialize,
    },
  ),
);
