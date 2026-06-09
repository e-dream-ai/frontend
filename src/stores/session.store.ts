import { create } from "zustand";
import { useFlowStore } from "./flow.store";
import { useStudioStore } from "./studio.store";
import { useStudioModeStore } from "./studio-mode.store";
import type { StudioSession } from "@/types/session.types";
import {
  MAX_SESSIONS,
  SESSIONS_STORAGE_KEY,
  ACTIVE_SESSION_KEY,
} from "@/types/session.types";

// ---------------------------------------------------------------------------
// Set serialization helpers
// ---------------------------------------------------------------------------

interface SerializedSet {
  __type: "Set";
  values: unknown[];
}

function isSerializedSet(value: unknown): value is SerializedSet {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as SerializedSet).__type === "Set" &&
    Array.isArray((value as SerializedSet).values)
  );
}

/**
 * JSON replacer: strips functions, serializes Sets with a marker object.
 */
function stateReplacer(_key: string, value: unknown): unknown {
  if (typeof value === "function") return undefined;
  if (value instanceof Set) {
    return { __type: "Set", values: [...value] };
  }
  return value;
}

/**
 * Walk a parsed JSON object and revive any `{ __type: "Set", values: [...] }`
 * back into real Set instances.
 */
function reviveSets(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(reviveSets);
  if (isSerializedSet(obj)) return new Set(obj.values);
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      result[k] = reviveSets(v);
    }
    return result;
  }
  return obj;
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function persistSessions(sessions: StudioSession[]): void {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    /* quota exceeded — ignore */
  }
}

function persistActiveId(id: string | null): void {
  try {
    if (id === null) {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    } else {
      localStorage.setItem(ACTIVE_SESSION_KEY, id);
    }
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Synchronous init — must run at module load, not in a useEffect
// ---------------------------------------------------------------------------

function loadInitialState(): {
  sessions: StudioSession[];
  activeSessionId: string | null;
} {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    const activeId = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) {
      return {
        sessions: JSON.parse(raw) as StudioSession[],
        activeSessionId: activeId,
      };
    }
  } catch {
    /* corrupted */
  }
  return { sessions: [], activeSessionId: null };
}

const initialState = loadInitialState();

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function defaultSessionName(): string {
  return new Date().toLocaleString();
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function extractThumbnail(
  flowState: Record<string, unknown>,
  batchState: Record<string, unknown>,
  mode: "flow" | "batch",
): string | undefined {
  if (mode === "flow") {
    const keyframes = flowState.keyframes;
    if (Array.isArray(keyframes) && keyframes.length > 0) {
      const first = keyframes[0] as { imageUrl?: string };
      return first.imageUrl ?? undefined;
    }
  } else {
    const images = batchState.images;
    if (Array.isArray(images) && images.length > 0) {
      const first = images[0] as { url?: string; imageUrl?: string };
      return first.url ?? first.imageUrl ?? undefined;
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Store type
// ---------------------------------------------------------------------------

export type SessionStoreState = {
  sessions: StudioSession[];
  activeSessionId: string | null;

  createSession: (name?: string) => void;
  switchSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  deleteSession: (id: string) => void;
  duplicateSession: (id: string) => void;
  saveCurrentSession: () => void;
};

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useSessionStore = create<SessionStoreState>()((set, get) => ({
  sessions: initialState.sessions,
  activeSessionId: initialState.activeSessionId,

  /**
   * Capture flow + batch state into the currently-active session record and
   * persist to localStorage.
   */
  saveCurrentSession: () => {
    const { sessions, activeSessionId } = get();
    if (!activeSessionId) return;

    const idx = sessions.findIndex((s) => s.id === activeSessionId);
    if (idx === -1) return;

    // Capture raw state — serialize to strip functions, revive Sets so the
    // stored snapshot is plain JSON (no live Set instances).
    const flowRaw = useFlowStore.getState();
    const batchRaw = useStudioStore.getState();
    const mode = useStudioModeStore.getState().mode;

    const flowState = JSON.parse(
      JSON.stringify(flowRaw, stateReplacer),
    ) as Record<string, unknown>;
    const batchState = JSON.parse(
      JSON.stringify(batchRaw, stateReplacer),
    ) as Record<string, unknown>;

    const thumbnail = extractThumbnail(flowState, batchState, mode);

    const updated: StudioSession = {
      ...sessions[idx],
      updatedAt: new Date().toISOString(),
      mode,
      flowState,
      batchState,
      thumbnail,
    };

    const next = sessions.map((s, i) => (i === idx ? updated : s));
    set({ sessions: next });
    persistSessions(next);
  },

  /**
   * Create a new named session and make it active. Saves the current session
   * first, then resets the stores to a blank slate.
   */
  createSession: (name?: string) => {
    const { sessions, saveCurrentSession } = get();
    if (sessions.length >= MAX_SESSIONS) return;

    saveCurrentSession();

    const mode = useStudioModeStore.getState().mode;
    const session: StudioSession = {
      id: generateId(),
      name: name ?? defaultSessionName(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode,
      flowState: {},
      batchState: {},
    };

    const next = [...sessions, session];
    set({ sessions: next, activeSessionId: session.id });
    persistSessions(next);
    persistActiveId(session.id);

    // Reset both stores for a blank new session
    useFlowStore.getState().resetFlow();
    useStudioStore.getState().resetSession();
  },

  /**
   * Save the current session then load the target session's state into both
   * stores.
   */
  switchSession: (id: string) => {
    const { sessions, saveCurrentSession } = get();

    saveCurrentSession();

    const session = sessions.find((s) => s.id === id);
    if (!session) return;

    // Restore flow state
    if (Object.keys(session.flowState).length > 0) {
      const flowRevived = reviveSets(session.flowState) as Record<
        string,
        unknown
      >;
      useFlowStore.setState(
        flowRevived as Parameters<typeof useFlowStore.setState>[0],
      );
      // Order matters: reconcile first (mark stale in-flight as failed),
      // then recompute (rebuild transition list from keyframes).
      useFlowStore.getState().reconcileStaleTransitions();
      useFlowStore.getState().recomputeTransitions();
    } else {
      useFlowStore.getState().resetFlow();
    }

    // Restore batch state — revive Sets (excludedCombos)
    if (Object.keys(session.batchState).length > 0) {
      const batchRevived = reviveSets(session.batchState) as Record<
        string,
        unknown
      >;
      useStudioStore.setState(
        batchRevived as Parameters<typeof useStudioStore.setState>[0],
      );
    } else {
      useStudioStore.getState().resetSession();
    }

    // Restore mode
    useStudioModeStore.getState().setMode(session.mode);

    set({ activeSessionId: id });
    persistActiveId(id);
  },

  /**
   * Rename a session by id.
   */
  renameSession: (id: string, name: string) => {
    const { sessions } = get();
    const next = sessions.map((s) =>
      s.id === id ? { ...s, name, updatedAt: new Date().toISOString() } : s,
    );
    set({ sessions: next });
    persistSessions(next);
  },

  /**
   * Delete a session. If it was the active session, switch to another one
   * (or null if none remain).
   */
  deleteSession: (id: string) => {
    const { sessions, activeSessionId, switchSession } = get();
    const remaining = sessions.filter((s) => s.id !== id);

    // Update sessions list first, before any switchSession call, so that
    // saveCurrentSession (called inside switchSession) does not re-save the
    // deleted session's state into the new active slot.
    set({ sessions: remaining });
    persistSessions(remaining);

    if (activeSessionId === id) {
      if (remaining.length > 0) {
        switchSession(remaining[remaining.length - 1].id);
      } else {
        set({ activeSessionId: null });
        persistActiveId(null);
        // Reset stores to blank state
        useFlowStore.getState().resetFlow();
        useStudioStore.getState().resetSession();
      }
    }
  },

  /**
   * Duplicate a session, appending " (copy)" to the name.
   */
  duplicateSession: (id: string) => {
    const { sessions } = get();
    if (sessions.length >= MAX_SESSIONS) return;

    const source = sessions.find((s) => s.id === id);
    if (!source) return;

    const copy: StudioSession = {
      ...source,
      id: generateId(),
      name: `${source.name} (copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [...sessions, copy];
    set({ sessions: next });
    persistSessions(next);
  },
}));
