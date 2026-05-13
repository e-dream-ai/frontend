import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StudioMode } from "@/types/flow.types";

type StudioModeState = {
  mode: StudioMode;
  setMode: (mode: StudioMode) => void;
};

export const useStudioModeStore = create<StudioModeState>()(
  persist(
    (set) => ({
      mode: "flow" as StudioMode,
      setMode: (mode) => set({ mode }),
    }),
    { name: "studio-mode", version: 1 },
  ),
);
