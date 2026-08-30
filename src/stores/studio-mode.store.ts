import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StudioMode } from "@/types/flow.types";

type StudioModeState = {
  mode: StudioMode;
  setMode: (mode: StudioMode) => void;
};

/**
 * v2 renamed the "batch" mode to "action" (#729). Without this, a stored
 * "batch" rehydrates as a mode no branch matches and the studio body renders
 * empty.
 */
export function migrateStudioMode(persisted: unknown): unknown {
  const state = persisted as Record<string, unknown> | null;
  return state?.mode === "batch" ? { ...state, mode: "action" } : state;
}

export const useStudioModeStore = create<StudioModeState>()(
  persist(
    (set) => ({
      mode: "flow" as StudioMode,
      setMode: (mode) => set({ mode }),
    }),
    { name: "studio-mode", version: 2, migrate: migrateStudioMode },
  ),
);
