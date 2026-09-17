import type {
  EditorId,
  EditorProjectState,
} from "@/types/editor-project.types";
import type { StudioMode } from "@/types/flow.types";
import {
  toPersistedActionState,
  toPersistedFlowState,
} from "./editor-project-state";

export const LEGACY_SESSIONS_KEY = "studio-sessions";
export const LEGACY_ACTIVE_SESSION_KEY = "studio-active-session-id";
export const LEGACY_MODE_KEY = "studio-mode";

type LegacySession = {
  id?: string;
  name?: string;
  mode?: string;
  flowState?: Record<string, unknown>;
  actionState?: Record<string, unknown>;
  batchState?: Record<string, unknown>;
  uprezState?: Record<string, unknown>;
  thumbnail?: string;
  updatedAt?: string;
};

export type PendingProject = {
  editorId: EditorId;
  name: string;
  state: EditorProjectState;
  thumbnail?: string | null;
};

const hasContent = (blob?: Record<string, unknown>) =>
  Boolean(blob) && Object.keys(blob as object).length > 0;

const toProjectState = (
  mode: StudioMode,
  blob: Record<string, unknown>,
): EditorProjectState => {
  if (mode === "flow") return toPersistedFlowState(blob) as EditorProjectState;
  if (mode === "action")
    return toPersistedActionState(blob) as EditorProjectState;
  return blob as EditorProjectState;
};

export const readLegacySessions = (): LegacySession[] => {
  try {
    const raw = window.localStorage.getItem(LEGACY_SESSIONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LegacySession[]) : [];
  } catch {
    return [];
  }
};

export const planSessionMigration = (
  sessions: readonly LegacySession[],
): PendingProject[] => {
  const pending: PendingProject[] = [];

  sessions.forEach((session, index) => {
    const baseName = session.name?.trim() || `Session ${index + 1}`;
    const action = session.actionState ?? session.batchState;

    const blobs: Array<[StudioMode, Record<string, unknown> | undefined]> = [
      ["flow", session.flowState],
      ["action", action],
      ["uprez", session.uprezState],
    ];

    const populated = blobs.filter(([, blob]) => hasContent(blob));

    populated.forEach(([mode, blob]) => {
      pending.push({
        editorId: mode,
        name: populated.length > 1 ? `${baseName} (${mode})` : baseName,
        state: toProjectState(mode, blob as Record<string, unknown>),
        thumbnail: session.thumbnail ?? null,
      });
    });
  });

  return pending;
};

export const clearLegacySessions = () => {
  try {
    window.localStorage.removeItem(LEGACY_SESSIONS_KEY);
    window.localStorage.removeItem(LEGACY_ACTIVE_SESSION_KEY);
    window.localStorage.removeItem(LEGACY_MODE_KEY);
  } catch {
    /* storage unavailable */
  }
};
