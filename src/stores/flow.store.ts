import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  FlowKeyframe,
  FlowTransition,
  TransitionStatus,
  VariationCandidate,
} from "@/types/flow.types";
import type { VideoModel, LoRAConfig } from "@/types/studio.types";

export const LOOP_KEYFRAME_ID = "__loop__";

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

export type FlowStoreState = {
  // Phase 0
  keyframes: FlowKeyframe[];
  loop: boolean;
  addKeyframe: (keyframe: FlowKeyframe) => void;
  updateKeyframe: (id: string, patch: Partial<FlowKeyframe>) => void;
  removeKeyframe: (id: string) => void;
  reorderKeyframes: (orderedIds: string[]) => void;

  // i2i candidate staging — candidates are excluded from transition derivation
  // until accepted, so they never spawn generation jobs.
  addI2iCandidates: (parentId: string, candidates: FlowKeyframe[]) => void;
  acceptI2iCandidate: (id: string) => void;
  discardI2iCandidate: (id: string) => void;
  setLoop: (loop: boolean) => void;
  keyframesWithLoop: () => FlowKeyframe[];
  resetFlow: () => void;

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

  // i2i — selected user API endpoint for image-to-image variations.
  // Non-persisted UI state (resolved fresh from the user's endpoint list each session).
  i2iEndpointUuid: string | null;

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
  setI2iEndpoint: (uuid: string | null) => void;
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

  // Variation actions — keyframes
  addKeyframeVariations: (
    keyframeId: string,
    candidates: VariationCandidate[],
  ) => void;
  selectKeyframeVariation: (keyframeId: string, variationId: string) => void;
  clearKeyframeVariations: (keyframeId: string) => void;
  updateKeyframeVariation: (
    keyframeId: string,
    variationId: string,
    patch: Partial<VariationCandidate>,
  ) => void;

  // Variation actions — transitions
  addTransitionVariations: (
    transitionIndex: number,
    candidates: VariationCandidate[],
  ) => void;
  selectTransitionVariation: (
    transitionIndex: number,
    variationId: string,
  ) => void;
  clearTransitionVariations: (transitionIndex: number) => void;
  updateTransitionVariation: (
    transitionIndex: number,
    variationId: string,
    patch: Partial<VariationCandidate>,
  ) => void;
};

const PHASE_1_DEFAULTS = {
  globalPresetId: "",
  globalPrompt: "",
  globalNegativePrompt: "",
  globalDuration: 5,
  globalModel: "ltx-i2v" as VideoModel,
  globalNumInferenceSteps: 30,
  globalGuidance: 5.0,
  globalLora: undefined as LoRAConfig[] | undefined,
  transitions: [] as FlowTransition[],
  selectedTransitionIndex: null as number | null,
  settingsExpanded: false,
  previewLightboxOpen: false,
  i2iEndpointUuid: null as string | null,
};

/**
 * Build the keyframe sequence that drives transition derivation.
 * i2i candidates are a staging area and must NOT participate in the timeline,
 * so they are filtered out BEFORE the synthetic loop frame is appended.
 * Transitions are therefore derived only over real (non-candidate) keyframes.
 */
function timelineKeyframesWithLoop(
  keyframes: FlowKeyframe[],
  loop: boolean,
): FlowKeyframe[] {
  const real = keyframes.filter((kf) => !kf.i2iCandidate);
  return buildKeyframesWithLoop(real, loop);
}

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
        set((s) => {
          const keyframes = [...s.keyframes, keyframe];
          return {
            keyframes,
            transitions: deriveTransitions(
              timelineKeyframesWithLoop(keyframes, s.loop),
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
              timelineKeyframesWithLoop(keyframes, s.loop),
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
              timelineKeyframesWithLoop(keyframes, s.loop),
              s.transitions,
            ),
          };
        }),

      // Append i2i candidates flagged so derivation skips them. Recompute
      // transitions: per the filter in timelineKeyframesWithLoop the candidates
      // are excluded, so no garbage transitions appear between them.
      addI2iCandidates: (parentId, candidates) =>
        set((s) => {
          const flagged = candidates.map((kf) => ({
            ...kf,
            i2iCandidate: true,
            i2iParentId: parentId,
          }));
          const keyframes = [...s.keyframes, ...flagged];
          return {
            keyframes,
            transitions: deriveTransitions(
              timelineKeyframesWithLoop(keyframes, s.loop),
              s.transitions,
            ),
          };
        }),

      // Promote a candidate to a real keyframe: clear the staging flags and
      // re-derive so it is wired into the timeline transitions.
      acceptI2iCandidate: (id) =>
        set((s) => {
          const keyframes = s.keyframes.map((kf) =>
            kf.id === id
              ? { ...kf, i2iCandidate: undefined, i2iParentId: undefined }
              : kf,
          );
          return {
            keyframes,
            transitions: deriveTransitions(
              timelineKeyframesWithLoop(keyframes, s.loop),
              s.transitions,
            ),
          };
        }),

      // Remove a candidate entirely and re-derive (mirrors removeKeyframe).
      discardI2iCandidate: (id) =>
        set((s) => {
          const keyframes = s.keyframes.filter((kf) => kf.id !== id);
          return {
            keyframes,
            transitions: deriveTransitions(
              timelineKeyframesWithLoop(keyframes, s.loop),
              s.transitions,
            ),
          };
        }),

      setLoop: (loop) =>
        set((s) => ({
          loop,
          transitions: deriveTransitions(
            timelineKeyframesWithLoop(s.keyframes, loop),
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
      setI2iEndpoint: (uuid) => set({ i2iEndpointUuid: uuid }),

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
            timelineKeyframesWithLoop(s.keyframes, s.loop),
            s.transitions,
          ),
        })),

      reconcileStaleTransitions: () =>
        set((s) => {
          // Only fail in-flight work that has NO backend job to recover (no
          // dreamUuid). Items WITH a dreamUuid are left in queue/processing so
          // the polling hook (useFlowJobProgress) re-attaches and recovers their
          // real status after a reload / session switch — work cooking in
          // another session must survive switching back and forth.
          const reconcileVariations = (vars?: VariationCandidate[]) =>
            vars?.map((v) =>
              (v.status === "queue" || v.status === "processing") &&
              !v.dreamUuid
                ? { ...v, status: "failed" as const, progress: undefined }
                : v,
            );
          return {
            transitions: s.transitions.map((t) => {
              const dreamInFlight =
                t.status === "processing" || t.status === "queue";
              const uprezInFlight =
                t.uprezStatus === "processing" || t.uprezStatus === "queue";
              return {
                ...t,
                ...(dreamInFlight &&
                  !t.dreamUuid && {
                    status: "failed" as const,
                    progress: undefined,
                  }),
                ...(uprezInFlight &&
                  !t.uprezDreamUuid && {
                    uprezStatus: "failed" as const,
                    uprezProgress: undefined,
                  }),
                ...(t.variations && {
                  variations: reconcileVariations(t.variations),
                }),
              };
            }),
            keyframes: s.keyframes.map((kf) =>
              kf.variations
                ? { ...kf, variations: reconcileVariations(kf.variations) }
                : kf,
            ),
          };
        }),

      // Variation actions — keyframes
      addKeyframeVariations: (keyframeId, candidates) =>
        set((s) => ({
          keyframes: s.keyframes.map((kf) =>
            kf.id === keyframeId
              ? { ...kf, variations: [...(kf.variations || []), ...candidates] }
              : kf,
          ),
        })),

      selectKeyframeVariation: (keyframeId, variationId) =>
        set((s) => {
          const kf = s.keyframes.find((k) => k.id === keyframeId);
          const variation = kf?.variations?.find((v) => v.id === variationId);
          if (!kf || !variation || variation.status !== "processed") return s;
          return {
            keyframes: s.keyframes.map((k) =>
              k.id === keyframeId
                ? {
                    ...k,
                    activeVariationId: variationId,
                    imageUrl: variation.imageUrl || k.imageUrl,
                    dreamUuid: variation.dreamUuid || k.dreamUuid,
                  }
                : k,
            ),
          };
        }),

      clearKeyframeVariations: (keyframeId) =>
        set((s) => ({
          keyframes: s.keyframes.map((kf) =>
            kf.id === keyframeId
              ? { ...kf, variations: undefined, activeVariationId: undefined }
              : kf,
          ),
        })),

      updateKeyframeVariation: (keyframeId, variationId, patch) =>
        set((s) => ({
          keyframes: s.keyframes.map((kf) =>
            kf.id === keyframeId
              ? {
                  ...kf,
                  variations: kf.variations?.map((v) =>
                    v.id === variationId ? { ...v, ...patch } : v,
                  ),
                }
              : kf,
          ),
        })),

      // Variation actions — transitions
      addTransitionVariations: (index, candidates) =>
        set((s) => ({
          transitions: s.transitions.map((t, i) =>
            i === index
              ? { ...t, variations: [...(t.variations || []), ...candidates] }
              : t,
          ),
        })),

      selectTransitionVariation: (index, variationId) =>
        set((s) => {
          const transition = s.transitions[index];
          const variation = transition?.variations?.find(
            (v) => v.id === variationId,
          );
          if (!transition || !variation || variation.status !== "processed")
            return s;
          return {
            transitions: s.transitions.map((t, i) =>
              i === index
                ? {
                    ...t,
                    activeVariationId: variationId,
                    dreamUuid: variation.dreamUuid || t.dreamUuid,
                    status: "processed" as const,
                  }
                : t,
            ),
          };
        }),

      clearTransitionVariations: (index) =>
        set((s) => ({
          transitions: s.transitions.map((t, i) =>
            i === index
              ? { ...t, variations: undefined, activeVariationId: undefined }
              : t,
          ),
        })),

      updateTransitionVariation: (index, variationId, patch) =>
        set((s) => ({
          transitions: s.transitions.map((t, i) =>
            i === index
              ? {
                  ...t,
                  variations: t.variations?.map((v) =>
                    v.id === variationId ? { ...v, ...patch } : v,
                  ),
                }
              : t,
          ),
        })),
    }),
    {
      name: "flow-session",
      version: 4,
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
          // VariationCandidate fields added to keyframes and transitions; no data migration needed.
          return state;
        }
        return state;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Order matters: reconcile must run first to mark stale in-flight
        // jobs as "failed" before recompute preserves them via the existing map.
        state.reconcileStaleTransitions();
        state.recomputeTransitions();
        // Drop a persisted selection that no longer points at a real transition.
        const idx = state.selectedTransitionIndex;
        if (idx !== null && (idx < 0 || idx >= state.transitions.length)) {
          state.selectTransition(null);
        }
      },
      partialize: (state) => ({
        // Strip transient upload state and skip not-yet-finalized keyframes —
        // a half-uploaded record with a dead objectURL is worse than nothing.
        // A finalized keyframe has either a backend Keyframe UUID (playlist)
        // or an image Dream UUID (uploaded).
        keyframes: state.keyframes
          // Exclude unsettled records AND i2i candidates. A candidate has no
          // accepted place in the timeline yet; persisting one would resurrect
          // a staging card on reload that no transition references.
          .filter(
            (kf) =>
              (kf.keyframeUuid || kf.dreamUuid) &&
              !kf.uploadStatus &&
              !kf.i2iCandidate,
          )
          .map((kf) => ({
            id: kf.id,
            keyframeUuid: kf.keyframeUuid,
            dreamUuid: kf.dreamUuid,
            imageUrl: kf.imageUrl,
            name: kf.name,
            isLoopKeyframe: kf.isLoopKeyframe,
            variations: kf.variations?.filter(
              (v) => v.status !== "queue" && v.status !== "processing",
            ),
            activeVariationId: kf.activeVariationId,
          })),
        loop: state.loop,
        transitions: state.transitions.map((t) => ({
          ...t,
          variations: t.variations?.filter(
            (v) => v.status !== "queue" && v.status !== "processing",
          ),
        })),
        globalPresetId: state.globalPresetId,
        globalPrompt: state.globalPrompt,
        globalNegativePrompt: state.globalNegativePrompt,
        globalDuration: state.globalDuration,
        globalModel: state.globalModel,
        globalNumInferenceSteps: state.globalNumInferenceSteps,
        globalGuidance: state.globalGuidance,
        globalLora: state.globalLora,
      }),
    },
  ),
);
