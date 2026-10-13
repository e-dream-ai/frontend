import { create } from "zustand";
import type { PlaylistSummary } from "@/components/pages/studio/hooks/useUserPlaylists";
import type {
  InterpolationFactor,
  UpscaleFactor,
} from "@/components/pages/studio/constants/enhance-factor-options";

export const enhancePlaylistName = (sourceName: string) =>
  `${sourceName} (enhance)`;

export type EnhanceFormState = {
  sourcePlaylist: PlaylistSummary | null;
  nameOverride: string | null;
  upscaleFactor: UpscaleFactor;
  interpolationFactor: InterpolationFactor;
};

export type EnhanceStoreState = EnhanceFormState & {
  setSourcePlaylist: (playlist: PlaylistSummary) => void;
  setNameOverride: (name: string) => void;
  setUpscaleFactor: (factor: UpscaleFactor) => void;
  setInterpolationFactor: (factor: InterpolationFactor) => void;
  restoreEnhance: (snapshot: Partial<EnhanceFormState>) => void;
  resetEnhance: () => void;
};

const ENHANCE_DEFAULTS: EnhanceFormState = {
  sourcePlaylist: null,
  nameOverride: null,
  upscaleFactor: 2,
  interpolationFactor: 2,
};

export const selectEnhanceProject = (
  state: EnhanceStoreState,
): EnhanceFormState => ({
  sourcePlaylist: state.sourcePlaylist,
  nameOverride: state.nameOverride,
  upscaleFactor: state.upscaleFactor,
  interpolationFactor: state.interpolationFactor,
});

export const useEnhanceStore = create<EnhanceStoreState>()((set) => ({
  ...ENHANCE_DEFAULTS,

  setSourcePlaylist: (playlist) =>
    set((s) => {
      const followedSource =
        !s.nameOverride?.trim() ||
        (s.sourcePlaylist !== null &&
          s.nameOverride === enhancePlaylistName(s.sourcePlaylist.name));
      return {
        sourcePlaylist: playlist,
        nameOverride: followedSource
          ? enhancePlaylistName(playlist.name)
          : s.nameOverride,
      };
    }),
  setNameOverride: (nameOverride) => set({ nameOverride }),
  setUpscaleFactor: (upscaleFactor) => set({ upscaleFactor }),
  setInterpolationFactor: (interpolationFactor) => set({ interpolationFactor }),

  restoreEnhance: (snapshot) =>
    set({
      sourcePlaylist: snapshot.sourcePlaylist ?? null,
      nameOverride:
        snapshot.nameOverride ??
        (snapshot.sourcePlaylist
          ? enhancePlaylistName(snapshot.sourcePlaylist.name)
          : null),
      upscaleFactor: snapshot.upscaleFactor ?? ENHANCE_DEFAULTS.upscaleFactor,
      // Always the default rather than the saved value (frontend#782).
      interpolationFactor: ENHANCE_DEFAULTS.interpolationFactor,
    }),
  resetEnhance: () => set({ ...ENHANCE_DEFAULTS }),
}));
