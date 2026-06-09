import type { StudioMode } from "@/types/flow.types";

export interface StudioSession {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  mode: StudioMode;
  flowState: Record<string, unknown>;
  batchState: Record<string, unknown>;
  thumbnail?: string;
}

export const MAX_SESSIONS = 20;
export const SESSIONS_STORAGE_KEY = "studio-sessions";
export const ACTIVE_SESSION_KEY = "studio-active-session-id";
