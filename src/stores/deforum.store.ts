import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  DeforumClip,
  DeforumRender,
  DeforumRenderKind,
  DeforumRenderStatus,
  DeforumSettings,
} from "@/types/deforum.types";
import {
  DEFAULT_DEFORUM_SETTINGS,
  randomDeforumSeed,
} from "@/components/pages/studio/constants/deforum-options";

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

type DeforumStoreState = {
  clips: DeforumClip[];
  /** Clip ids; the last one is the primary the panel names and shows. */
  selectedIds: string[];
  savedPlaylistUuid: string | null;
  syncedPlaylistDreamUuids: string[];

  /** Add a clip seeded from the primary selection (or the last clip). */
  addClip: () => void;
  duplicateClips: (ids: readonly string[]) => void;
  removeClips: (ids: readonly string[]) => void;
  moveClip: (id: string, delta: number) => void;
  renameClip: (id: string, name: string) => void;

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
  "clips" | "savedPlaylistUuid" | "syncedPlaylistDreamUuids"
>;

const DEFAULTS = {
  clips: [] as DeforumClip[],
  selectedIds: [] as string[],
  savedPlaylistUuid: null as string | null,
  syncedPlaylistDreamUuids: [] as string[],
};

const stripProgress = (render?: DeforumRender): DeforumRender | undefined =>
  render && { ...render, progress: undefined };

export const selectDeforumProject = (
  state: DeforumStoreState,
): DeforumProjectState => ({
  clips: state.clips.map((clip) => ({
    ...clip,
    test: stripProgress(clip.test),
    final: stripProgress(clip.final),
  })),
  savedPlaylistUuid: state.savedPlaylistUuid,
  syncedPlaylistDreamUuids: state.syncedPlaylistDreamUuids,
});

const clipName = (clips: readonly DeforumClip[]) =>
  `Animation ${clips.length + 1}`;

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

export const useDeforumStore = create<DeforumStoreState>()((set) => ({
  ...DEFAULTS,

  addClip: () =>
    set((s) => {
      const primaryId = s.selectedIds[s.selectedIds.length - 1];
      const source =
        s.clips.find((c) => c.id === primaryId) ?? s.clips[s.clips.length - 1];
      const clip: DeforumClip = {
        id: uuidv4(),
        name: clipName(s.clips),
        // Carry the look over but not the seed: a copy with the same seed and
        // prompts would render the same video.
        settings: source
          ? {
              ...copyDeforumSettings(source.settings),
              seed: randomDeforumSeed(),
            }
          : newDeforumSettings(),
      };
      return { clips: [...s.clips, clip], selectedIds: [clip.id] };
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
          name: `${clip.name} copy`,
          settings: copyDeforumSettings(clip.settings),
        };
        clips.push(copy);
        added.push(copy.id);
      }
      return added.length ? { clips, selectedIds: added } : s;
    }),

  removeClips: (ids) =>
    set((s) => {
      const drop = new Set(ids);
      return {
        clips: s.clips.filter((c) => !drop.has(c.id)),
        selectedIds: s.selectedIds.filter((id) => !drop.has(id)),
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
      return { clips };
    }),

  renameClip: (id, name) =>
    set((s) => ({
      clips: s.clips.map((c) => (c.id === id ? { ...c, name } : c)),
    })),

  setClipSettings: (ids, patch) =>
    set((s) => {
      if (ids.length === 0) return s;
      const touched = new Set(ids);
      return {
        clips: s.clips.map((clip) =>
          touched.has(clip.id)
            ? {
                ...clip,
                settings: {
                  ...clip.settings,
                  ...patch,
                  // Each clip owns its prompt rows; a shared array would make a
                  // later single-clip edit leak into every clip it was set on.
                  ...(patch.prompts && {
                    prompts: patch.prompts.map((p) => ({ ...p })),
                  }),
                },
              }
            : clip,
        ),
      };
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
    set((s) => ({
      clips: s.clips.map((clip) =>
        clip.id === id
          ? { ...clip, [kind]: { status: "queue", ...render } }
          : clip,
      ),
    })),

  updateRenderStatus: (dreamUuid, status, progress) =>
    set((s) => {
      const clips = mapRenders(s.clips, dreamUuid, (render) =>
        render.status === status && render.progress === progress
          ? render
          : { ...render, status, progress },
      );
      return clips === s.clips ? s : { clips };
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
      clips: (state.clips ?? []).map((clip) => ({
        ...clip,
        settings: { ...newDeforumSettings(), ...clip.settings },
      })),
      selectedIds: [],
    }),

  resetDeforum: () => set({ ...DEFAULTS }),
}));
