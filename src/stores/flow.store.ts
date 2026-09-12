import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  FlowReferenceFrame,
  FlowTransition,
  TransitionHistoryEntry,
  TransitionRunSettings,
  TransitionStatus,
} from "@/types/flow.types";
import type { VideoModel, LoRAConfig } from "@/types/studio.types";
import { stepLightboxIndex } from "@/utils/lightbox.util";

export const LOOP_FRAME_ID = "__loop__";

export function buildFramesWithLoop(
  referenceFrames: FlowReferenceFrame[],
  loop: boolean,
): FlowReferenceFrame[] {
  if (!loop || referenceFrames.length < 2) return referenceFrames;
  const first = referenceFrames[0];
  return [
    ...referenceFrames,
    {
      ...first,
      id: LOOP_FRAME_ID,
      isLoopFrame: true,
      uploadStatus: undefined,
      uploadProgress: undefined,
    },
  ];
}

type FlowStoreState = {
  // Phase 0
  referenceFrames: FlowReferenceFrame[];
  loop: boolean;
  addReferenceFrame: (frame: FlowReferenceFrame) => void;
  updateReferenceFrame: (
    id: string,
    patch: Partial<FlowReferenceFrame>,
  ) => void;
  removeReferenceFrame: (id: string) => void;
  reorderReferenceFrames: (orderedIds: string[]) => void;
  setLoop: (loop: boolean) => void;
  referenceFramesWithLoop: () => FlowReferenceFrame[];
  resetFlow: () => void;

  // Phase 1 — global transition settings
  globalPresetId: string;
  globalPrompt: string;
  globalNegativePrompt: string;
  globalDuration: number;
  globalModel: VideoModel;
  globalNumInferenceSteps: number;
  globalGuidance: number;
  globalSeed: number;
  globalLora: LoRAConfig[] | undefined;

  // Phase 1 — transitions
  transitions: FlowTransition[];

  // Phase 1 — UI state
  // Selected transition indices in click order; the last one is the "primary"
  // (the one the panel names and the preview plays). Empty = global mode.
  selectedTransitionIndices: number[];
  settingsExpanded: boolean;
  previewLightboxOpen: boolean;
  // Explicit "play this dream now" request. Carries a sequence number because
  // clicking the same transition twice must replay it — a bare uuid would be
  // an unchanged value the preview could not tell apart from no request.
  previewPlayRequest: { dreamUuid: string; seq: number } | null;
  // Id (not index) of the frame shown in the lightbox; null = closed.
  frameLightboxId: string | null;

  // Phase 1 — actions
  setGlobalPreset: (id: string) => void;
  setGlobalPrompt: (prompt: string) => void;
  setGlobalNegativePrompt: (prompt: string) => void;
  setGlobalDuration: (duration: number) => void;
  setGlobalModel: (model: VideoModel) => void;
  setGlobalNumInferenceSteps: (steps: number) => void;
  setGlobalGuidance: (guidance: number) => void;
  setGlobalSeed: (seed: number) => void;
  setGlobalLora: (lora: LoRAConfig[] | undefined) => void;
  setTransitionOverride: (
    index: number,
    overrides: Partial<FlowTransition>,
  ) => void;
  clearTransitionOverride: (index: number) => void;
  selectTransition: (index: number | null) => void;
  toggleTransitionSelection: (index: number) => void;
  selectAllTransitions: () => void;
  clearTransitionSelection: () => void;
  pruneTransitionSelection: () => void;
  setSettingsExpanded: (expanded: boolean) => void;
  setPreviewLightboxOpen: (open: boolean) => void;
  requestPreviewPlay: (dreamUuid: string) => void;
  openFrameLightbox: (id: string) => void;
  closeFrameLightbox: () => void;
  stepFrameLightbox: (delta: number) => void;
  updateTransitionStatus: (
    index: number,
    status: TransitionStatus,
    progress?: number,
  ) => void;
  setTransitionDream: (index: number, dreamUuid: string) => void;
  recordTransitionRun: (
    index: number,
    dreamUuid: string,
    settings: TransitionRunSettings,
    createdAt: number,
  ) => void;
  restoreTransitionRun: (index: number, dreamUuid: string) => void;
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
  globalPresetId: "Abstract",
  globalPrompt: "",
  globalNegativePrompt: "",
  globalDuration: 5,
  globalModel: "kling-25-i2v" as VideoModel,
  globalNumInferenceSteps: 30,
  globalGuidance: 0.5,
  globalSeed: -1,
  globalLora: undefined as LoRAConfig[] | undefined,
  transitions: [] as FlowTransition[],
  selectedTransitionIndices: [] as number[],
  settingsExpanded: false,
  previewLightboxOpen: false,
  previewPlayRequest: null as { dreamUuid: string; seq: number } | null,
  frameLightboxId: null as string | null,
  savedPlaylistUuid: null as string | null,
  syncedPlaylistDreamUuids: [] as string[],
};

// Past runs are cheap to keep but not free — each one is a persisted settings
// snapshot and a dream the history strip may fetch. 20 is well past the point
// where a user is still comparing takes.
export const MAX_TRANSITION_HISTORY = 20;

/** Drop selected indices that the new transition list no longer has. */
function pruneSelection(indices: number[], length: number): number[] {
  const next = indices.filter((i) => i >= 0 && i < length);
  return next.length === indices.length ? indices : next;
}

function markHistoryCompleted(
  history: TransitionHistoryEntry[] | undefined,
  dreamUuid: string,
): TransitionHistoryEntry[] | undefined {
  if (!history) return history;
  let changed = false;
  const next = history.map((entry) => {
    if (entry.dreamUuid !== dreamUuid || entry.completed) return entry;
    changed = true;
    return { ...entry, completed: true };
  });
  return changed ? next : history;
}

/**
 * Build transitions from adjacent frame pairs.
 * Preserves existing transition state when pairs still match.
 */
function deriveTransitions(
  referenceFramesWithLoop: FlowReferenceFrame[],
  existing: FlowTransition[],
): FlowTransition[] {
  const pairs: Array<{ fromId: string; toId: string }> = [];
  for (let i = 0; i < referenceFramesWithLoop.length - 1; i++) {
    const from = referenceFramesWithLoop[i];
    const to = referenceFramesWithLoop[i + 1];
    // Use real frame IDs — map __loop__ back to the first frame's ID
    const fromId =
      from.id === LOOP_FRAME_ID
        ? referenceFramesWithLoop[0]?.id ?? from.id
        : from.id;
    const toId =
      to.id === LOOP_FRAME_ID ? referenceFramesWithLoop[0]?.id ?? to.id : to.id;
    pairs.push({ fromId, toId });
  }

  // Build index of existing transitions for O(1) lookup
  const existingMap = new Map<string, FlowTransition>();
  for (const t of existing) {
    existingMap.set(`${t.fromFrameId}:${t.toFrameId}`, t);
  }

  return pairs.map(({ fromId, toId }) => {
    const key = `${fromId}:${toId}`;
    const prev = existingMap.get(key);
    if (prev) return prev;
    return {
      fromFrameId: fromId,
      toFrameId: toId,
      status: "idle" as const,
    };
  });
}

export const flowPartialize = (state: FlowStoreState) => ({
  referenceFrames: state.referenceFrames
    .filter((frame) => {
      if (frame.uploadStatus === "uploading") return Boolean(frame.dreamUuid);
      if (frame.uploadStatus === "failed") return false;
      return Boolean(frame.keyframeUuid || frame.dreamUuid);
    })
    .map((frame) => ({
      id: frame.id,
      keyframeUuid: frame.keyframeUuid,
      dreamUuid: frame.dreamUuid,
      imageUrl: frame.imageUrl,
      name: frame.name,
      // Persisted so a reloaded flow renders at the right shape, and flags
      // mismatches, without waiting for every thumbnail to load again.
      naturalWidth: frame.naturalWidth,
      naturalHeight: frame.naturalHeight,
      isLoopFrame: frame.isLoopFrame,
      uploadStatus: frame.uploadStatus,
      uploadProgress: frame.uploadProgress,
    })),
  loop: state.loop,
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
  globalSeed: state.globalSeed,
  globalLora: state.globalLora,
});

/**
 * Map the pre-#719 persisted shape onto the current one: `keyframes` ->
 * `referenceFrames`, `isLoopKeyframe` -> `isLoopFrame`, and the transition
 * endpoint ids. `keyframeUuid` is untouched — it still points at a backend
 * Keyframe entity. A no-op once the stored state is already on the new keys.
 */
export function renameLegacyKeyframeKeys(
  state: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...state };

  if (next.referenceFrames === undefined && Array.isArray(next.keyframes)) {
    next.referenceFrames = (next.keyframes as Record<string, unknown>[]).map(
      (frame) => {
        const { isLoopKeyframe, ...rest } = frame;
        return isLoopKeyframe === undefined
          ? rest
          : { ...rest, isLoopFrame: isLoopKeyframe };
      },
    );
  }
  delete next.keyframes;

  if (Array.isArray(next.transitions)) {
    next.transitions = (next.transitions as Record<string, unknown>[]).map(
      (transition) => {
        const { fromKeyframeId, toKeyframeId, ...rest } = transition;
        return {
          ...rest,
          fromFrameId: rest.fromFrameId ?? fromKeyframeId,
          toFrameId: rest.toFrameId ?? toKeyframeId,
        };
      },
    );
  }

  return next;
}

export const useFlowStore = create<FlowStoreState>()(
  persist(
    (set, get) => ({
      // Phase 0 state
      referenceFrames: [],
      loop: false,

      addReferenceFrame: (frame) =>
        set((s) => {
          const referenceFrames = [...s.referenceFrames, frame];
          return {
            referenceFrames,
            transitions: deriveTransitions(
              buildFramesWithLoop(referenceFrames, s.loop),
              s.transitions,
            ),
          };
        }),

      updateReferenceFrame: (id, patch) =>
        set((s) => ({
          referenceFrames: s.referenceFrames.map((frame) =>
            frame.id === id ? { ...frame, ...patch } : frame,
          ),
        })),

      removeReferenceFrame: (id) =>
        set((s) => {
          const referenceFrames = s.referenceFrames.filter(
            (frame) => frame.id !== id,
          );
          const transitions = deriveTransitions(
            buildFramesWithLoop(referenceFrames, s.loop),
            s.transitions,
          );
          return {
            referenceFrames,
            frameLightboxId:
              s.frameLightboxId === id ? null : s.frameLightboxId,
            transitions,
            selectedTransitionIndices: pruneSelection(
              s.selectedTransitionIndices,
              transitions.length,
            ),
          };
        }),

      reorderReferenceFrames: (orderedIds) =>
        set((s) => {
          const map = new Map(
            s.referenceFrames.map((frame) => [frame.id, frame]),
          );
          const referenceFrames = orderedIds
            .map((id) => map.get(id))
            .filter(
              (frame): frame is FlowReferenceFrame => frame !== undefined,
            );
          return {
            referenceFrames,
            transitions: deriveTransitions(
              buildFramesWithLoop(referenceFrames, s.loop),
              s.transitions,
            ),
          };
        }),

      setLoop: (loop) =>
        set((s) => {
          const transitions = deriveTransitions(
            buildFramesWithLoop(s.referenceFrames, loop),
            s.transitions,
          );
          return {
            loop,
            transitions,
            selectedTransitionIndices: pruneSelection(
              s.selectedTransitionIndices,
              transitions.length,
            ),
          };
        }),

      referenceFramesWithLoop: () => {
        const { referenceFrames, loop } = get();
        return buildFramesWithLoop(referenceFrames, loop);
      },

      resetFlow: () =>
        set({
          referenceFrames: [],
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
      setGlobalSeed: (seed) => set({ globalSeed: seed }),
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
            fromFrameId: t.fromFrameId,
            toFrameId: t.toFrameId,
            status: t.status,
            progress: t.progress,
            dreamUuid: t.dreamUuid,
            // Past runs are results, not settings — clearing overrides must not
            // throw them away, or "Reset to defaults" silently drops history.
            history: t.history,
            uprezDreamUuid: t.uprezDreamUuid,
            uprezStatus: t.uprezStatus,
            uprezProgress: t.uprezProgress,
          };
          return { transitions };
        }),

      selectTransition: (index) =>
        set((s) => ({
          selectedTransitionIndices:
            index === null || index < 0 || index >= s.transitions.length
              ? []
              : [index],
        })),

      toggleTransitionSelection: (index) =>
        set((s) => {
          if (index < 0 || index >= s.transitions.length) return s;
          const current = s.selectedTransitionIndices;
          const without = current.filter((i) => i !== index);
          // Re-append rather than sort: the newest click is the primary, which
          // is what the panel names and the preview plays.
          return {
            selectedTransitionIndices:
              without.length === current.length ? [...current, index] : without,
          };
        }),

      selectAllTransitions: () =>
        set((s) => ({
          selectedTransitionIndices: s.transitions.map((_, i) => i),
        })),

      clearTransitionSelection: () => set({ selectedTransitionIndices: [] }),

      pruneTransitionSelection: () =>
        set((s) => {
          const valid = s.selectedTransitionIndices.filter(
            (i) => i >= 0 && i < s.transitions.length,
          );
          return valid.length === s.selectedTransitionIndices.length
            ? s
            : { selectedTransitionIndices: valid };
        }),
      setSettingsExpanded: (expanded) => set({ settingsExpanded: expanded }),
      setPreviewLightboxOpen: (open) => set({ previewLightboxOpen: open }),

      requestPreviewPlay: (dreamUuid) =>
        set((s) => ({
          previewPlayRequest: {
            dreamUuid,
            seq: (s.previewPlayRequest?.seq ?? 0) + 1,
          },
        })),

      openFrameLightbox: (id) =>
        set((s) => ({
          frameLightboxId: s.referenceFrames.some((frame) => frame.id === id)
            ? id
            : null,
        })),
      closeFrameLightbox: () => set({ frameLightboxId: null }),
      stepFrameLightbox: (delta) =>
        set((s) => {
          const current = s.referenceFrames.findIndex(
            (frame) => frame.id === s.frameLightboxId,
          );
          if (current === -1) return { frameLightboxId: null };
          const next = stepLightboxIndex(
            current,
            delta,
            s.referenceFrames.length,
          );
          return {
            frameLightboxId: next === null ? null : s.referenceFrames[next].id,
          };
        }),

      updateTransitionStatus: (index, status, progress) =>
        set((s) => {
          const transitions = [...s.transitions];
          const prev = transitions[index];
          if (!prev) return s;
          // A run only earns a history thumbnail once it has actually rendered.
          const history =
            status === "processed" && prev.dreamUuid
              ? markHistoryCompleted(prev.history, prev.dreamUuid)
              : prev.history;
          transitions[index] = {
            ...prev,
            status,
            progress,
            history,
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

      recordTransitionRun: (index, dreamUuid, settings, createdAt) =>
        set((s) => {
          const transitions = [...s.transitions];
          const prev = transitions[index];
          if (!prev) return s;
          const history = [...(prev.history ?? [])];
          // Regenerating an entry that is already in history (restore, then
          // Generate without changing anything) must not duplicate the row.
          const existing = history.findIndex((e) => e.dreamUuid === dreamUuid);
          const entry: TransitionHistoryEntry = {
            dreamUuid,
            createdAt,
            settings,
          };
          if (existing === -1) history.push(entry);
          else history[existing] = { ...history[existing], ...entry };
          const replacesDream = prev.dreamUuid !== dreamUuid;
          transitions[index] = {
            ...prev,
            dreamUuid,
            history: history.slice(-MAX_TRANSITION_HISTORY),
            // The uprez was derived from the dream being replaced; carrying it
            // over would attach an upscale of one take to a different one.
            ...(replacesDream && {
              uprezDreamUuid: undefined,
              uprezStatus: undefined,
              uprezProgress: undefined,
            }),
          };
          return { transitions };
        }),

      restoreTransitionRun: (index, dreamUuid) =>
        set((s) => {
          const transitions = [...s.transitions];
          const prev = transitions[index];
          if (!prev) return s;
          const entry = prev.history?.find((e) => e.dreamUuid === dreamUuid);
          if (!entry || !entry.completed) return s;
          transitions[index] = {
            ...prev,
            // The snapshot is a full override set, so the panel shows exactly
            // the values this run used regardless of how globals have drifted.
            ...entry.settings,
            dreamUuid,
            status: "processed",
            progress: undefined,
            // The uprez belonged to the run being replaced, not to this one.
            uprezDreamUuid: undefined,
            uprezStatus: undefined,
            uprezProgress: undefined,
          };
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
        set((s) => {
          const transitions = deriveTransitions(
            buildFramesWithLoop(s.referenceFrames, s.loop),
            s.transitions,
          );
          return {
            transitions,
            selectedTransitionIndices: pruneSelection(
              s.selectedTransitionIndices,
              transitions.length,
            ),
          };
        }),

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
      version: 6,
      migrate: (persisted: unknown, version: number) => {
        // v6 renamed the "keyframe" concept to "reference frame" (#719). Run
        // the key rename before the version chain below: that chain returns
        // early per version, so a store several versions behind would
        // otherwise keep the legacy keys and rehydrate with an empty flow.
        const state = renameLegacyKeyframeKeys(
          persisted as Record<string, unknown>,
        );
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
          return {
            ...state,
            globalGuidance: PHASE_1_DEFAULTS.globalGuidance,
            transitions: (
              (state.transitions as FlowTransition[] | undefined) ?? []
            ).map((transition) => {
              const next = { ...transition };
              delete next.guidanceOverride;
              return next;
            }),
          };
        }
        return state;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.reconcileStaleTransitions();
        state.recomputeTransitions();
        // Selection is UI state and isn't persisted, but a session restore can
        // hand one over — drop indices that no longer name a transition.
        state.pruneTransitionSelection();
      },
      partialize: flowPartialize,
    },
  ),
);
