import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  FlowReferenceFrame,
  FlowTransition,
  TransitionHistoryEntry,
  TransitionSettings,
  TransitionStatus,
} from "@/types/flow.types";
import type { VideoModel, LoRAConfig } from "@/types/studio.types";
import { stepLightboxIndex } from "@/utils/lightbox.util";
import { ACTION_PRESETS } from "@/components/pages/studio/constants/action-presets";
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
  // Selected transition indices in click order; the last one is the "primary"
  // (the one the panel names and the preview plays). Never empty while the flow
  // has transitions — the panel edits the selection and nothing else, so an
  // empty one would leave it with no target. See `ensureSelection`.
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

/**
 * The selection to keep after the transition list is rebuilt.
 *
 * Three rules, in order:
 *  - indices the new list no longer has are dropped;
 *  - a selection that covered the whole flow keeps covering it, so transitions
 *    created by adding a frame are edited along with the rest instead of
 *    silently sitting out the next change;
 *  - it is never empty while there are transitions, because the panel edits the
 *    selection and has no other scope to fall back on.
 *
 * Every path that rebuilds `transitions` must run this. Deriving transitions
 * without it is what left a freshly added first transition unselected, with the
 * panel showing controls wired to nothing.
 */
function nextSelection(
  indices: number[],
  previousCount: number,
  nextCount: number,
): number[] {
  if (nextCount === 0) return indices.length === 0 ? indices : [];
  const all = () => Array.from({ length: nextCount }, (_, i) => i);
  const coveredEverything =
    previousCount > 0 && indices.length >= previousCount;
  if (coveredEverything) return all();
  const kept = indices.filter((i) => i >= 0 && i < nextCount);
  if (kept.length === 0) return all();
  return kept.length === indices.length ? indices : kept;
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

/**
 * Keep a selection whenever there is something to select.
 *
 * The panel edits the selection and has no other scope, so an empty selection
 * is a panel with nothing to write to. Falling back to everything also makes
 * the common move after "Generate all" — change one setting on the whole flow —
 * the thing that happens by default.
 */
function ensureSelection(indices: number[], transitionCount: number): number[] {
  if (transitionCount === 0) return indices.length === 0 ? indices : [];
  if (indices.length > 0) return indices;
  return Array.from({ length: transitionCount }, (_, i) => i);
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
});

/**
 * Shape of a v<=6 persisted transition: nine optional overrides, each meaning
 * "inherit" when absent.
 */
type LegacyTransition = Omit<FlowTransition, "settings"> & {
  presetOverride?: string;
  promptOverride?: string;
  negativePromptOverride?: string;
  durationOverride?: number;
  modelOverride?: VideoModel;
  numInferenceStepsOverride?: number;
  guidanceOverride?: number;
  seedOverride?: number;
  loraOverride?: LoRAConfig[];
};

type LegacyGlobals = {
  globalPresetId?: string;
  globalPrompt?: string;
  globalNegativePrompt?: string;
  globalDuration?: number;
  globalModel?: VideoModel;
  globalNumInferenceSteps?: number;
  globalGuidance?: number;
  globalSeed?: number;
  globalLora?: LoRAConfig[];
};

/**
 * Collapse `override ?? global ?? preset` to a value, once, at rehydrate.
 *
 * This runs the old resolution rules one last time, which is what makes the
 * change invisible: a session saved yesterday opens showing exactly what it
 * showed yesterday. Doing it here and not at read time is the whole point —
 * afterwards there is no chain left to run.
 */
export function materialiseLegacySettings(
  transition: LegacyTransition,
  globals: LegacyGlobals,
): TransitionSettings {
  const presetName = transition.presetOverride ?? globals.globalPresetId ?? "";
  const preset = ACTION_PRESETS.find((pack) => pack.name === presetName)
    ?.actions[0];

  // Prompt and LoRA fell through to the preset; the rest stopped at the global.
  const prompt = transition.promptOverride ?? globals.globalPrompt ?? "";
  const highNoiseLoras =
    transition.loraOverride ??
    globals.globalLora ??
    preset?.highNoiseLoras ??
    [];

  // Low-noise LoRAs were never stored — they came back only when the stored
  // high-noise set still matched the preset's. Same test, applied once.
  const matchesPreset =
    preset?.highNoiseLoras?.[0]?.path === highNoiseLoras[0]?.path;

  return {
    prompt: prompt || preset?.prompt || "",
    negativePrompt:
      transition.negativePromptOverride ?? globals.globalNegativePrompt ?? "",
    duration:
      transition.durationOverride ??
      globals.globalDuration ??
      DEFAULT_TRANSITION_SETTINGS.duration,
    model:
      transition.modelOverride ??
      globals.globalModel ??
      DEFAULT_TRANSITION_SETTINGS.model,
    steps:
      transition.numInferenceStepsOverride ??
      globals.globalNumInferenceSteps ??
      DEFAULT_TRANSITION_SETTINGS.steps,
    guidance:
      transition.guidanceOverride ??
      globals.globalGuidance ??
      DEFAULT_TRANSITION_SETTINGS.guidance,
    seed:
      transition.seedOverride ??
      globals.globalSeed ??
      DEFAULT_TRANSITION_SETTINGS.seed,
    highNoiseLoras,
    lowNoiseLoras: matchesPreset ? preset?.lowNoiseLoras ?? [] : [],
  };
}

const LEGACY_OVERRIDE_KEYS = [
  "presetOverride",
  "promptOverride",
  "negativePromptOverride",
  "durationOverride",
  "modelOverride",
  "numInferenceStepsOverride",
  "guidanceOverride",
  "seedOverride",
  "loraOverride",
] as const;

/** Rewrite every persisted transition (and its history) onto `settings`. */
export function migrateOverridesToSettings(
  state: Record<string, unknown>,
): Record<string, unknown> {
  const globals = state as LegacyGlobals;
  const transitions = (
    (state.transitions as LegacyTransition[] | undefined) ?? []
  ).map((transition) => {
    const next: Record<string, unknown> = {
      ...transition,
      settings: materialiseLegacySettings(transition, globals),
      // A run snapshot was stored under the same nine override keys. Replaying
      // it through the same resolver keeps restore and the staleness dot
      // honest; an entry from before snapshots existed has nothing to convert.
      history: (transition.history ?? []).map((entry) =>
        entry.settings
          ? {
              ...entry,
              settings: materialiseLegacySettings(
                entry.settings as unknown as LegacyTransition,
                globals,
              ),
            }
          : entry,
      ),
    };
    for (const key of LEGACY_OVERRIDE_KEYS) delete next[key];
    return next;
  });

  const cleaned: Record<string, unknown> = { ...state, transitions };
  for (const key of [
    "globalPresetId",
    "globalPrompt",
    "globalNegativePrompt",
    "globalDuration",
    "globalModel",
    "globalNumInferenceSteps",
    "globalGuidance",
    "globalSeed",
    "globalLora",
  ]) {
    delete cleaned[key];
  }
  return cleaned;
}

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
          const transitions = deriveTransitions(
            buildFramesWithLoop(referenceFrames, s.loop),
            s.transitions,
          );
          return {
            referenceFrames,
            transitions,
            selectedTransitionIndices: nextSelection(
              s.selectedTransitionIndices,
              s.transitions.length,
              transitions.length,
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
            selectedTransitionIndices: nextSelection(
              s.selectedTransitionIndices,
              s.transitions.length,
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
          const transitions = deriveTransitions(
            buildFramesWithLoop(referenceFrames, s.loop),
            s.transitions,
          );
          return {
            referenceFrames,
            transitions,
            selectedTransitionIndices: nextSelection(
              s.selectedTransitionIndices,
              s.transitions.length,
              transitions.length,
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
              s.transitions.length,
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
          selectedTransitionIndices: ensureSelection(
            index === null || index < 0 || index >= s.transitions.length
              ? []
              : [index],
            s.transitions.length,
          ),
        })),

      toggleTransitionSelection: (index) =>
        set((s) => {
          if (index < 0 || index >= s.transitions.length) return s;
          const current = s.selectedTransitionIndices;
          const without = current.filter((i) => i !== index);
          // Re-append rather than sort: the newest click is the primary, which
          // is what the panel names and the preview plays.
          // Toggling off the only selected transition does nothing. It used to
          // fall back to selecting everything, which read as a wild overshoot
          // for a click that asked to deselect one thing. The strip shows this
          // is coming by switching the cursor while a toggle modifier is held.
          if (without.length === 0) return s;
          return {
            selectedTransitionIndices:
              without.length === current.length ? [...current, index] : without,
          };
        }),

      selectAllTransitions: () =>
        set((s) => ({
          selectedTransitionIndices: s.transitions.map((_, i) => i),
        })),

      // Clearing falls back to the whole flow rather than to nothing: see
      // `ensureSelection`. Kept as an action because deselecting the last
      // transition routes through here.
      clearTransitionSelection: () =>
        set((s) => ({
          selectedTransitionIndices: ensureSelection([], s.transitions.length),
        })),

      pruneTransitionSelection: () =>
        set((s) => {
          const valid = ensureSelection(
            s.selectedTransitionIndices.filter(
              (i) => i >= 0 && i < s.transitions.length,
            ),
            s.transitions.length,
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
            selectedTransitionIndices: nextSelection(
              s.selectedTransitionIndices,
              s.transitions.length,
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
      version: 7,
      migrate: (persisted: unknown, version: number) => {
        // v6 renamed the "keyframe" concept to "reference frame" (#719). Run
        // the key rename before the version chain below: that chain returns
        // early per version, so a store several versions behind would
        // otherwise keep the legacy keys and rehydrate with an empty flow.
        const state = renameLegacyKeyframeKeys(
          persisted as Record<string, unknown>,
        );
        if (version < 2) {
          return migrateOverridesToSettings({
            ...state,
            ...PHASE_1_DEFAULTS,
          });
        }
        if (version < 3) {
          // Negative prompt added; force LTX since it's the only working model.
          return migrateOverridesToSettings({
            ...state,
            globalNegativePrompt: "",
            globalModel: "ltx-i2v",
          });
        }
        if (version < 4) {
          return migrateOverridesToSettings({
            ...state,
            globalModel: "kling-25-i2v",
            globalDuration: 5,
          });
        }
        // The version chain below returns early, so v7 runs on the way out
        // rather than as another branch: every older shape still has overrides
        // to materialise, whatever else its own step did.
        if (version < 5) {
          const next = {
            ...state,
            globalGuidance: DEFAULT_TRANSITION_SETTINGS.guidance,
            transitions: (
              (state.transitions as Record<string, unknown>[] | undefined) ?? []
            ).map((transition) => {
              const t = { ...transition };
              delete t.guidanceOverride;
              return t;
            }),
          };
          return migrateOverridesToSettings(next);
        }
        return migrateOverridesToSettings(state);
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
