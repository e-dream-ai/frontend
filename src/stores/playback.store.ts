import { create } from "zustand";
import { Dream } from "@/types/dream.types";

type PlaybackState = {
  currentDream?: Dream;
  isLoadingCurrentDream: boolean;
  setCurrentDream: (dream?: Dream) => void;
  setIsLoadingCurrentDream: (isLoading: boolean) => void;
  reset: () => void;
};

export const usePlaybackStore = create<PlaybackState>((set) => ({
  currentDream: undefined,
  isLoadingCurrentDream: false,
  setCurrentDream: (dream) => set({ currentDream: dream }),
  setIsLoadingCurrentDream: (isLoading) =>
    set({ isLoadingCurrentDream: isLoading }),
  reset: () => set({ currentDream: undefined, isLoadingCurrentDream: false }),
}));

export default usePlaybackStore;
