import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { useFlowStore, flowPartialize } from "./flow.store";
import { useStudioStore, studioPartialize } from "./studio.store";
import { useStudioModeStore } from "./studio-mode.store";
import type { StudioMode } from "@/types/flow.types";
import type { StudioSession } from "@/types/session.types";
import {
  MAX_SESSIONS,
  SESSIONS_STORAGE_KEY,
  ACTIVE_SESSION_KEY,
} from "@/types/session.types";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function persistSessions(sessions: StudioSession[]): void {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    /* quota exceeded */
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

const SESSION_NAME_RE = /^Session (\d+)$/;

function defaultSessionName(sessions: StudioSession[]): string {
  let max = 0;
  for (const s of sessions) {
    const match = SESSION_NAME_RE.exec(s.name);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `Session ${max + 1}`;
}

function makeSession(name: string, mode: StudioMode): StudioSession {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name,
    createdAt: now,
    updatedAt: now,
    mode,
    flowState: {},
    batchState: {},
  };
}

function capSessions(sessions: StudioSession[]): StudioSession[] {
  return sessions.length > MAX_SESSIONS
    ? sessions.slice(sessions.length - MAX_SESSIONS)
    : sessions;
}

function extractThumbnail(
  flowState: Record<string, unknown>,
  batchState: Record<string, unknown>,
  mode: StudioMode,
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

export type SessionStoreState = {
  sessions: StudioSession[];
  activeSessionId: string | null;

  ensureActiveSession: () => void;
  createSession: (name?: string) => void;
  switchSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  deleteSession: (id: string) => void;
  duplicateSession: (id: string) => void;
  saveCurrentSession: () => void;
};

export const useSessionStore = create<SessionStoreState>()((set, get) => ({
  sessions: initialState.sessions,
  activeSessionId: initialState.activeSessionId,

  saveCurrentSession: () => {
    const { sessions, activeSessionId } = get();
    if (!activeSessionId) return;

    const idx = sessions.findIndex((s) => s.id === activeSessionId);
    if (idx === -1) return;

    const mode = useStudioModeStore.getState().mode;
    const flowState = clone(flowPartialize(useFlowStore.getState()));
    const batchState = clone(studioPartialize(useStudioStore.getState()));
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

  ensureActiveSession: () => {
    const { sessions, activeSessionId } = get();
    if (activeSessionId && sessions.some((s) => s.id === activeSessionId)) {
      return;
    }

    const mode = useStudioModeStore.getState().mode;
    const session = makeSession(defaultSessionName(sessions), mode);

    const next = capSessions([...sessions, session]);
    set({ sessions: next, activeSessionId: session.id });
    persistSessions(next);
    persistActiveId(session.id);
    get().saveCurrentSession();
  },

  createSession: (name?: string) => {
    const { sessions, saveCurrentSession } = get();

    saveCurrentSession();

    const mode = useStudioModeStore.getState().mode;
    const session = makeSession(name ?? defaultSessionName(sessions), mode);

    const next = capSessions([...sessions, session]);
    set({ sessions: next, activeSessionId: session.id });
    persistSessions(next);
    persistActiveId(session.id);

    useFlowStore.getState().resetFlow();
    useStudioStore.getState().resetSession();
  },

  switchSession: (id: string) => {
    const { sessions, saveCurrentSession } = get();

    saveCurrentSession();

    const session = sessions.find((s) => s.id === id);
    if (!session) return;

    if (Object.keys(session.flowState).length > 0) {
      useFlowStore.setState(
        session.flowState as Parameters<typeof useFlowStore.setState>[0],
      );
      useFlowStore.setState({
        selectedTransitionIndex: null,
        settingsExpanded: false,
        previewLightboxOpen: false,
      });
      useFlowStore.getState().reconcileStaleTransitions();
      useFlowStore.getState().recomputeTransitions();
    } else {
      useFlowStore.getState().resetFlow();
    }

    if (Object.keys(session.batchState).length > 0) {
      const batch = session.batchState as Record<string, unknown>;
      useStudioStore.setState({
        ...batch,
        excludedCombos: new Set((batch.excludedCombos as string[]) ?? []),
      } as Parameters<typeof useStudioStore.setState>[0]);
    } else {
      useStudioStore.getState().resetSession();
    }

    useStudioModeStore.getState().setMode(session.mode);

    set({ activeSessionId: id });
    persistActiveId(id);
  },

  renameSession: (id: string, name: string) => {
    const { sessions } = get();
    const next = sessions.map((s) =>
      s.id === id ? { ...s, name, updatedAt: new Date().toISOString() } : s,
    );
    set({ sessions: next });
    persistSessions(next);
  },

  deleteSession: (id: string) => {
    const { sessions, activeSessionId, switchSession } = get();
    const remaining = sessions.filter((s) => s.id !== id);

    set({ sessions: remaining });
    persistSessions(remaining);

    if (activeSessionId === id) {
      if (remaining.length > 0) {
        switchSession(remaining[remaining.length - 1].id);
      } else {
        set({ activeSessionId: null });
        persistActiveId(null);
        useFlowStore.getState().resetFlow();
        useStudioStore.getState().resetSession();
      }
    }
  },

  duplicateSession: (id: string) => {
    const { sessions } = get();
    if (sessions.length >= MAX_SESSIONS) return;

    const source = sessions.find((s) => s.id === id);
    if (!source) return;

    const now = new Date().toISOString();
    const copy: StudioSession = {
      ...source,
      id: uuidv4(),
      name: `${source.name} (copy)`,
      createdAt: now,
      updatedAt: now,
    };

    const next = [...sessions, copy];
    set({ sessions: next });
    persistSessions(next);
  },
}));
