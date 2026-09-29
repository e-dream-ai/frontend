import { create } from "zustand";
import type {
  FlowReferenceFrame,
  FlowTransition,
  TransitionHistoryEntry,
  TransitionSettings,
  TransitionStatus,
} from "@/types/flow.types";
import { stepLightboxIndex } from "@/utils/lightbox.util";
import { DEFAULT_TRANSITION_SETTINGS } from "@/components/pages/studio/constants/default-transition-settings";

export const LOOP_FRAME_ID = "__loop__";

export { DEFAULT_TRANSITION_SETTINGS };

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

  // Phase 1 — transitions
  transitions: FlowTransition[];

  // Phase 1 — UI state
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
  /** Write settings fields onto every given transition. The only settings write. */
  setTransitionSettings: (
    indices: readonly number[],
    patch: Partial<TransitionSettings>,
  ) => void;
  selectTransition: (index: number | null) => void;
  toggleTransitionSelection: (index: number) => void;
  selectAllTransitions: () => void;
  clearTransitionSelection: () => void;
  /** Drop these transitions from the selection, leaving the rest as it was. */
  deselectTransitions: (indices: readonly number[]) => void;
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
    settings: TransitionSettings,
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

const transitionKey = (t: FlowTransition) => `${t.fromFrameId}:${t.toFrameId}`;

/**
 * Carry the selection across a rebuilt transition list. Selection follows the
 * transitions themselves (their frame pair), not their positions, so deleting
 * or reordering frames never slides it onto a neighbour. A transition that did
 * not exist before arrives selected: new work is what the user wants to set up
 * next, and it lands as the primary so the settings panel opens on it. What was
 * selected and still exists stays selected; everything else stays unselected
 * until clicked.
 */
function nextSelection(
  indices: number[],
  previous: readonly FlowTransition[],
  next: readonly FlowTransition[],
): number[] {
  const nextIndexByKey = new Map(next.map((t, i) => [transitionKey(t), i]));
  const previousKeys = new Set(previous.map(transitionKey));
  const kept: number[] = [];
  for (const i of indices) {
    const t = previous[i];
    const at = t ? nextIndexByKey.get(transitionKey(t)) : undefined;
    if (at !== undefined) kept.push(at);
  }
  const added: number[] = [];
  next.forEach((t, i) => {
    if (!previousKeys.has(transitionKey(t))) added.push(i);
  });
  const result = [...kept, ...added];
  return result.length === indices.length &&
    result.every((v, i) => v === indices[i])
    ? indices
    : result;
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

  // A new pair inherits nothing and resolves nothing: it copies the settings of
  // the transition before it in the flow, which is the one the user was most
  // recently working on at that point. Only an empty flow reaches for the
  // built-in default. Copying from the result list (not `existing`) means a
  // frame dropped into the middle picks up its new neighbour, not whatever used
  // to sit at that index.
  const result: FlowTransition[] = [];
  for (const { fromId, toId } of pairs) {
    const prev = existingMap.get(`${fromId}:${toId}`);
    if (prev) {
      result.push(prev);
      continue;
    }
    const before = result[result.length - 1];
    result.push({
      fromFrameId: fromId,
      toFrameId: toId,
      status: "idle" as const,
      settings: { ...(before?.settings ?? DEFAULT_TRANSITION_SETTINGS) },
    });
  }
  return result;
}

export const selectFlowProject = (state: FlowStoreState) => ({
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
});

export const useFlowStore = create<FlowStoreState>()((set, get) => ({
  // Phase 0 state
  referenceFrames: [],
  loop: false,

  addReferenceFrame: (frame) =>
    set((s) => {
      const referenceFrames = [...s.referenceFrames, frame];
      const transitions = deriveTransitions(
        buildFramesWithLoop(referenceFrames, s.loop),
        s.transitions,
      );
      return {
        referenceFrames,
        transitions,
        selectedTransitionIndices: nextSelection(
          s.selectedTransitionIndices,
          s.transitions,
          transitions,
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
        frameLightboxId: s.frameLightboxId === id ? null : s.frameLightboxId,
        transitions,
        selectedTransitionIndices: nextSelection(
          s.selectedTransitionIndices,
          s.transitions,
          transitions,
        ),
      };
    }),

  reorderReferenceFrames: (orderedIds) =>
    set((s) => {
      const map = new Map(s.referenceFrames.map((frame) => [frame.id, frame]));
      const referenceFrames = orderedIds
        .map((id) => map.get(id))
        .filter((frame): frame is FlowReferenceFrame => frame !== undefined);
      const transitions = deriveTransitions(
        buildFramesWithLoop(referenceFrames, s.loop),
        s.transitions,
      );
      return {
        referenceFrames,
        transitions,
        selectedTransitionIndices: nextSelection(
          s.selectedTransitionIndices,
          s.transitions,
          transitions,
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
        selectedTransitionIndices: nextSelection(
          s.selectedTransitionIndices,
          s.transitions,
          transitions,
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

  // Phase 1 — transition actions
  setTransitionSettings: (indices, patch) =>
    set((s) => {
      if (indices.length === 0) return s;
      const touched = new Set(indices);
      return {
        transitions: s.transitions.map((transition, i) =>
          touched.has(i)
            ? {
                ...transition,
                settings: { ...transition.settings, ...patch },
              }
            : transition,
        ),
      };
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

  deselectTransitions: (indices) =>
    set((s) => {
      const drop = new Set(indices);
      const kept = s.selectedTransitionIndices.filter((i) => !drop.has(i));
      return kept.length === s.selectedTransitionIndices.length
        ? s
        : { selectedTransitionIndices: kept };
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
      const next = stepLightboxIndex(current, delta, s.referenceFrames.length);
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
        settings: { ...entry.settings },
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
        selectedTransitionIndices: nextSelection(
          s.selectedTransitionIndices,
          s.transitions,
          transitions,
        ),
      };
    }),

  reconcileStaleTransitions: () =>
    set((s) => ({
      transitions: s.transitions.map((t) => {
        const dreamStale =
          (t.status === "processing" || t.status === "queue") && !t.dreamUuid;
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
}));
