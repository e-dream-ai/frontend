import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RunPlaylistResult } from "@/api/playlist/mutation/useRunPlaylist";
import type { PlaylistSummary } from "@/components/pages/studio/hooks/useUserPlaylists";
import type {
  InterpolationFactor,
  UpscaleFactor,
} from "@/components/pages/studio/constants/uprez-factor-options";

export type UprezResult = {
  uuid: string;
  name: string;
  run: RunPlaylistResult | null;
  runFailed: boolean;
};

export type UprezFormState = {
  sourcePlaylist: PlaylistSummary | null;
  nameOverride: string | null;
  upscaleFactor: UpscaleFactor;
  interpolationFactor: InterpolationFactor;
  result: UprezResult | null;
};

export type UprezStoreState = UprezFormState & {
  setSourcePlaylist: (playlist: PlaylistSummary) => void;
  setNameOverride: (name: string) => void;
  setUpscaleFactor: (factor: UpscaleFactor) => void;
  setInterpolationFactor: (factor: InterpolationFactor) => void;
  setResult: (result: UprezResult | null) => void;
  restoreUprez: (snapshot: Partial<UprezFormState>) => void;
  resetUprez: () => void;
};

const UPREZ_DEFAULTS: UprezFormState = {
  sourcePlaylist: null,
  nameOverride: null,
  upscaleFactor: 2,
  interpolationFactor: 2,
  result: null,
};

export const uprezPartialize = (state: UprezStoreState): UprezFormState => ({
  sourcePlaylist: state.sourcePlaylist,
  nameOverride: state.nameOverride,
  upscaleFactor: state.upscaleFactor,
  interpolationFactor: state.interpolationFactor,
  result: state.result,
});

export const useUprezStore = create<UprezStoreState>()(
  persist(
    (set) => ({
      ...UPREZ_DEFAULTS,

      setSourcePlaylist: (playlist) =>
        set((s) => ({
          sourcePlaylist: playlist,
          nameOverride: s.nameOverride?.trim() ? s.nameOverride : null,
          result: null,
        })),
      setNameOverride: (nameOverride) => set({ nameOverride }),
      setUpscaleFactor: (upscaleFactor) => set({ upscaleFactor }),
      setInterpolationFactor: (interpolationFactor) =>
        set({ interpolationFactor }),
      setResult: (result) => set({ result }),

      restoreUprez: (snapshot) =>
        set({
          sourcePlaylist: snapshot.sourcePlaylist ?? null,
          nameOverride: snapshot.nameOverride ?? null,
          upscaleFactor: snapshot.upscaleFactor ?? UPREZ_DEFAULTS.upscaleFactor,
          interpolationFactor:
            snapshot.interpolationFactor ?? UPREZ_DEFAULTS.interpolationFactor,
          result: snapshot.result ?? null,
        }),
      resetUprez: () => set({ ...UPREZ_DEFAULTS }),
    }),
    { name: "uprez-session", version: 1, partialize: uprezPartialize },
  ),
);
