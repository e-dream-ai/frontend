import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  DeforumClip,
  DeforumPrompt,
  DeforumRender,
  DeforumRenderKind,
  DeforumRenderStatus,
  DeforumSettings,
  RemovedDeforumClip,
} from "@/types/deforum.types";
import {
  DEFAULT_DEFORUM_SETTINGS,
  randomDeforumSeed,
} from "@/components/pages/studio/constants/deforum-options";
import { withClipNames } from "@/components/pages/studio/utils/deforum-names";

export const newDeforumSettings = (): DeforumSettings => ({
  ...DEFAULT_DEFORUM_SETTINGS,
  seed: randomDeforumSeed(),
  prompts: [{ id: uuidv4(), frame: 0, text: "" }],
});

/** A deep enough copy that editing one clip's prompts never reaches another. */
export const copyDeforumSettings = (
  settings: DeforumSettings,
): DeforumSettings => ({
  ...settings,
  prompts: settings.prompts.map((p) => ({ ...p, id: uuidv4() })),
});

const ownPrompts = (prompts: readonly DeforumPrompt[]): DeforumPrompt[] =>
  prompts.map((p, i) => ({ ...p, frame: i === 0 ? 0 : p.frame }));

const completeSettings = (settings: DeforumSettings): DeforumSettings => {
  const complete = { ...newDeforumSettings(), ...settings };
  return { ...complete, prompts: ownPrompts(complete.prompts) };
};

const completeRender = (render?: DeforumRender): DeforumRender | undefined =>
  render && { ...render, settings: completeSettings(render.settings) };

const completeClip = (clip: DeforumClip): DeforumClip => ({
  ...clip,
  settings: completeSettings(clip.settings),
  test: completeRender(clip.test),
  final: completeRender(clip.final),
});

/** The most removed clips History keeps; the oldest drop off past this. */
export const DEFORUM_HISTORY_LIMIT = 100;

type DeforumStoreState = {
  clips: DeforumClip[];
  /** Clips taken out of the list, newest first. */
  removedClips: RemovedDeforumClip[];
  /** Clip ids; the last one is the primary the panel names and shows. */
  selectedIds: string[];
  savedPlaylistUuid: string | null;
  syncedPlaylistDreamUuids: string[];

  /** Add a clip seeded from the primary selection (or the last clip). */
  addClip: () => void;
  duplicateClips: (ids: readonly string[]) => void;
  /** Move clips to History. */
  removeClips: (ids: readonly string[]) => void;
  /** Put a clip from History back where it was, and select it. */
  restoreClip: (id: string) => void;
  moveClip: (id: string, delta: number) => void;

  /** Write settings fields onto every given clip. The only settings write. */
  setClipSettings: (
    ids: readonly string[],
    patch: Partial<DeforumSettings>,
  ) => void;

  selectClip: (id: string | null) => void;
  toggleClipSelection: (id: string) => void;
  selectAllClips: () => void;

  recordRender: (
    id: string,
    kind: DeforumRenderKind,
    render: Omit<DeforumRender, "status"> & { status?: DeforumRenderStatus },
  ) => void;
  updateRenderStatus: (
    dreamUuid: string,
    status: DeforumRenderStatus,
    progress?: number,
  ) => void;

  linkSavedPlaylist: (uuid: string, syncedDreamUuids: string[]) => void;
  setPlaylistDreamsSynced: (dreamUuids: string[]) => void;

  restoreDeforum: (state: Partial<DeforumProjectState>) => void;
  resetDeforum: () => void;
};

export type DeforumProjectState = Pick<
  DeforumStoreState,
  "clips" | "removedClips" | "savedPlaylistUuid" | "syncedPlaylistDreamUuids"
>;

const DEFAULTS = {
  clips: [] as DeforumClip[],
  removedClips: [] as RemovedDeforumClip[],
  selectedIds: [] as string[],
  savedPlaylistUuid: null as string | null,
  syncedPlaylistDreamUuids: [] as string[],
};

const stripProgress = (render?: DeforumRender): DeforumRender | undefined =>
  render && { ...render, progress: undefined };

const stripClipProgress = (clip: DeforumClip): DeforumClip => ({
  ...clip,
  test: stripProgress(clip.test),
  final: stripProgress(clip.final),
});

export const selectDeforumProject = (
  state: DeforumStoreState,
): DeforumProjectState => ({
  clips: state.clips.map(stripClipProgress),
  removedClips: state.removedClips.map((r) => ({
    ...r,
    clip: stripClipProgress(r.clip),
  })),
  savedPlaylistUuid: state.savedPlaylistUuid,
  syncedPlaylistDreamUuids: state.syncedPlaylistDreamUuids,
});

const mapRenders = (
  clips: DeforumClip[],
  dreamUuid: string,
  update: (render: DeforumRender) => DeforumRender,
): DeforumClip[] => {
  let changed = false;
  const next = clips.map((clip) => {
    const test =
      clip.test?.dreamUuid === dreamUuid ? update(clip.test) : clip.test;
    const final =
      clip.final?.dreamUuid === dreamUuid ? update(clip.final) : clip.final;
    if (test === clip.test && final === clip.final) return clip;
    changed = true;
    return { ...clip, test, final };
  });
  return changed ? next : clips;
};

/**
 * Apply `update` to every removed clip it changes. Renders keep running after
 * their clip is removed, and History shows them once they finish.
 */
const mapRemoved = (
  removed: RemovedDeforumClip[],
  update: (clip: DeforumClip) => DeforumClip,
): RemovedDeforumClip[] => {
  let changed = false;
  const next = removed.map((r) => {
    const clip = update(r.clip);
    if (clip === r.clip) return r;
    changed = true;
    return { ...r, clip };
  });
  return changed ? next : removed;
};

export const useDeforumStore = create<DeforumStoreState>()((set) => ({
  ...DEFAULTS,

  addClip: () =>
    set((s) => {
      const primaryId = s.selectedIds[s.selectedIds.length - 1];
      const source =
        s.clips.find((c) => c.id === primaryId) ?? s.clips[s.clips.length - 1];
      const clip: DeforumClip = {
        id: uuidv4(),
        // Named from its prompts, like every clip: see withClipNames.
        name: "",
        // Carry the look over but not the seed: a copy with the same seed and
        // prompts would render the same video.
        settings: source
          ? {
              ...copyDeforumSettings(source.settings),
              seed: randomDeforumSeed(),
            }
          : newDeforumSettings(),
      };
      return {
        clips: withClipNames([...s.clips, clip]),
        selectedIds: [clip.id],
      };
    }),

  duplicateClips: (ids) =>
    set((s) => {
      const wanted = new Set(ids);
      const clips: DeforumClip[] = [];
      const added: string[] = [];
      for (const clip of s.clips) {
        clips.push(clip);
        if (!wanted.has(clip.id)) continue;
        const copy: DeforumClip = {
          id: uuidv4(),
          name: "",
          settings: copyDeforumSettings(clip.settings),
        };
        clips.push(copy);
        added.push(copy.id);
      }
      return added.length
        ? { clips: withClipNames(clips), selectedIds: added }
        : s;
    }),

  removeClips: (ids) =>
    set((s) => {
      const drop = new Set(ids);
      const removedAt = Date.now();
      // Newest first; of several removed together, the last in the list
      // first, so putting them back in History order restores the list.
      const removed = s.clips
        .flatMap((clip, index) =>
          drop.has(clip.id) ? [{ clip, index, removedAt }] : [],
        )
        .reverse();
      if (removed.length === 0) return s;
      return {
        clips: withClipNames(s.clips.filter((c) => !drop.has(c.id))),
        removedClips: [...removed, ...s.removedClips].slice(
          0,
          DEFORUM_HISTORY_LIMIT,
        ),
        selectedIds: s.selectedIds.filter((id) => !drop.has(id)),
      };
    }),

  restoreClip: (id) =>
    set((s) => {
      const entry = s.removedClips.find((r) => r.clip.id === id);
      if (!entry) return s;
      const clips = [...s.clips];
      clips.splice(Math.min(entry.index, clips.length), 0, entry.clip);
      return {
        clips: withClipNames(clips),
        removedClips: s.removedClips.filter((r) => r !== entry),
        selectedIds: [id],
      };
    }),

  moveClip: (id, delta) =>
    set((s) => {
      const from = s.clips.findIndex((c) => c.id === id);
      const to = from + delta;
      if (from === -1 || to < 0 || to >= s.clips.length) return s;
      const clips = [...s.clips];
      const [clip] = clips.splice(from, 1);
      clips.splice(to, 0, clip);
      return { clips: withClipNames(clips) };
    }),

  setClipSettings: (ids, patch) =>
    set((s) => {
      if (ids.length === 0) return s;
      const touched = new Set(ids);
      const clips = s.clips.map((clip) =>
        touched.has(clip.id)
          ? {
              ...clip,
              settings: {
                ...clip.settings,
                ...patch,
                // Each clip owns its prompt rows; a shared array would make a
                // later single-clip edit leak into every clip it was set on.
                ...(patch.prompts && { prompts: ownPrompts(patch.prompts) }),
              },
            }
          : clip,
      );
      // Names come from prompts, so only a prompt edit can change them.
      return { clips: patch.prompts ? withClipNames(clips) : clips };
    }),

  selectClip: (id) =>
    set((s) => ({
      selectedIds: id && s.clips.some((c) => c.id === id) ? [id] : [],
    })),

  toggleClipSelection: (id) =>
    set((s) => {
      if (!s.clips.some((c) => c.id === id)) return s;
      const without = s.selectedIds.filter((x) => x !== id);
      // Re-append rather than sort: the newest click is the primary.
      return {
        selectedIds:
          without.length === s.selectedIds.length
            ? [...s.selectedIds, id]
            : without,
      };
    }),

  selectAllClips: () => set((s) => ({ selectedIds: s.clips.map((c) => c.id) })),

  recordRender: (id, kind, render) =>
    set((s) => {
      // The clip may have been removed while its render was being submitted.
      const record = (clip: DeforumClip): DeforumClip =>
        clip.id === id
          ? { ...clip, [kind]: { status: "queue", ...render } }
          : clip;
      return {
        clips: s.clips.map(record),
        removedClips: mapRemoved(s.removedClips, record),
      };
    }),

  updateRenderStatus: (dreamUuid, status, progress) =>
    set((s) => {
      const update = (render: DeforumRender) =>
        render.status === status && render.progress === progress
          ? render
          : { ...render, status, progress };
      const clips = mapRenders(s.clips, dreamUuid, update);
      const removedClips = mapRemoved(
        s.removedClips,
        (clip) => mapRenders([clip], dreamUuid, update)[0],
      );
      return clips === s.clips && removedClips === s.removedClips
        ? s
        : { clips, removedClips };
    }),

  linkSavedPlaylist: (uuid, syncedDreamUuids) =>
    set({
      savedPlaylistUuid: uuid,
      syncedPlaylistDreamUuids: Array.from(new Set(syncedDreamUuids)),
    }),

  setPlaylistDreamsSynced: (dreamUuids) =>
    set({ syncedPlaylistDreamUuids: Array.from(new Set(dreamUuids)) }),

  restoreDeforum: (state) =>
    set({
      ...DEFAULTS,
      ...state,
      // Fill fields added since the project was saved, so every clip's
      // settings stay complete.
      clips: withClipNames((state.clips ?? []).map(completeClip)),
      removedClips: (state.removedClips ?? []).map((r) => ({
        ...r,
        clip: completeClip(r.clip),
      })),
      selectedIds: [],
    }),

  resetDeforum: () => set({ ...DEFAULTS }),
}));
