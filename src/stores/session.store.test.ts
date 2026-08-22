import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import type { PersistedStudioSession } from "@/types/session.types";

beforeAll(() => {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
});

const { useSessionStore, migrateSessions } = await import("./session.store");
const { useFlowStore } = await import("./flow.store");
const { migrateStudioMode } = await import("./studio-mode.store");

describe("session store", () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({ sessions: [], activeSessionId: null });
    useFlowStore.getState().resetFlow();
  });

  it("creates a new session", () => {
    useSessionStore.getState().createSession("My Flow");
    const { sessions, activeSessionId } = useSessionStore.getState();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].name).toBe("My Flow");
    expect(activeSessionId).toBe(sessions[0].id);
  });

  it("switches between sessions", () => {
    useSessionStore.getState().createSession("Session A");
    useSessionStore.getState().createSession("Session B");
    const { sessions } = useSessionStore.getState();
    expect(sessions).toHaveLength(2);
    useSessionStore.getState().switchSession(sessions[0].id);
    expect(useSessionStore.getState().activeSessionId).toBe(sessions[0].id);
  });

  it("resets UI state on session switch", () => {
    useSessionStore.getState().createSession("Session A");
    useSessionStore.getState().createSession("Session B");

    useFlowStore.setState({
      selectedTransitionIndices: [3],
      settingsExpanded: true,
      previewLightboxOpen: true,
    });

    const { sessions } = useSessionStore.getState();
    useSessionStore.getState().switchSession(sessions[0].id);

    const flowState = useFlowStore.getState();
    expect(flowState.selectedTransitionIndices).toEqual([]);
    expect(flowState.settingsExpanded).toBe(false);
    expect(flowState.previewLightboxOpen).toBe(false);
  });

  it("renames a session", () => {
    useSessionStore.getState().createSession("Old Name");
    const { sessions } = useSessionStore.getState();
    useSessionStore.getState().renameSession(sessions[0].id, "New Name");
    expect(useSessionStore.getState().sessions[0].name).toBe("New Name");
  });

  it("deletes a session", () => {
    useSessionStore.getState().createSession("To Delete");
    useSessionStore.getState().createSession("Keep");
    const { sessions } = useSessionStore.getState();
    useSessionStore.getState().deleteSession(sessions[0].id);
    expect(useSessionStore.getState().sessions).toHaveLength(1);
    expect(useSessionStore.getState().sessions[0].name).toBe("Keep");
  });

  it("deletes active session and switches to remaining", () => {
    useSessionStore.getState().createSession("First");
    useSessionStore.getState().createSession("Second");
    const { sessions } = useSessionStore.getState();
    expect(useSessionStore.getState().activeSessionId).toBe(sessions[1].id);

    useSessionStore.getState().deleteSession(sessions[1].id);

    const updated = useSessionStore.getState();
    expect(updated.sessions).toHaveLength(1);
    expect(updated.activeSessionId).toBe(sessions[0].id);
  });

  it("duplicates a session", () => {
    useSessionStore.getState().createSession("Original");
    const { sessions } = useSessionStore.getState();
    useSessionStore.getState().duplicateSession(sessions[0].id);
    const updated = useSessionStore.getState().sessions;
    expect(updated).toHaveLength(2);
    expect(updated[1].name).toBe("Original (copy)");
  });

  it("caps at MAX_SESSIONS by dropping oldest", () => {
    for (let i = 0; i < 22; i++) {
      useSessionStore.getState().createSession(`Session ${i}`);
    }
    const { sessions } = useSessionStore.getState();
    expect(sessions.length).toBeLessThanOrEqual(20);
    expect(sessions[sessions.length - 1].name).toBe("Session 21");
  });

  it("saves and restores flow state across sessions", () => {
    useSessionStore.getState().createSession("Session A");
    useFlowStore.setState({ globalPrompt: "hello from A" });
    useSessionStore.getState().saveCurrentSession();

    useSessionStore.getState().createSession("Session B");
    useFlowStore.setState({ globalPrompt: "hello from B" });
    useSessionStore.getState().saveCurrentSession();

    const { sessions } = useSessionStore.getState();
    useSessionStore.getState().switchSession(sessions[0].id);
    expect(useFlowStore.getState().globalPrompt).toBe("hello from A");

    useSessionStore.getState().switchSession(sessions[1].id);
    expect(useFlowStore.getState().globalPrompt).toBe("hello from B");
  });

  it("ensureActiveSession adopts current live state without resetting", () => {
    expect(useSessionStore.getState().activeSessionId).toBeNull();
    useFlowStore.setState({ globalPrompt: "adopt me" });

    useSessionStore.getState().ensureActiveSession();

    const { sessions, activeSessionId } = useSessionStore.getState();
    expect(sessions).toHaveLength(1);
    expect(activeSessionId).toBe(sessions[0].id);
    expect(useFlowStore.getState().globalPrompt).toBe("adopt me");
    expect(
      (sessions[0].flowState as { globalPrompt?: string }).globalPrompt,
    ).toBe("adopt me");
  });

  it("ensureActiveSession is a no-op when a session is already active", () => {
    useSessionStore.getState().createSession("Existing");
    const count = useSessionStore.getState().sessions.length;
    useSessionStore.getState().ensureActiveSession();
    expect(useSessionStore.getState().sessions).toHaveLength(count);
  });
});

describe("legacy session migration (#719, #729)", () => {
  it("maps batchState onto actionState and batch mode onto action", () => {
    const legacySession: PersistedStudioSession = {
      id: "s1",
      name: "Session 1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      mode: "batch",
      flowState: {},
      batchState: { images: [{ uuid: "d1", url: "u1" }] },
    };

    const [migrated] = migrateSessions([legacySession]);

    expect(migrated.mode).toBe("action");
    expect(migrated.actionState).toEqual({
      images: [{ uuid: "d1", url: "u1" }],
    });
    expect(migrated).not.toHaveProperty("batchState");
  });

  it("renames the keyframe keys inside a session's flowState", () => {
    // Sessions snapshot the flow store, so the zustand migrate hook never
    // sees them — without this they would restore an empty flow.
    const legacySession: PersistedStudioSession = {
      id: "s1",
      name: "Session 1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      mode: "flow",
      flowState: {
        keyframes: [{ id: "a", dreamUuid: "d1", isLoopKeyframe: true }],
        transitions: [{ fromKeyframeId: "a", toKeyframeId: "b" }],
      },
      batchState: {},
    };

    const [migrated] = migrateSessions([legacySession]);

    const flowState = migrated.flowState as {
      referenceFrames: Array<{ isLoopFrame?: boolean }>;
      transitions: Array<{ fromFrameId?: string; toFrameId?: string }>;
    };
    expect(flowState).not.toHaveProperty("keyframes");
    expect(flowState.referenceFrames).toHaveLength(1);
    expect(flowState.referenceFrames[0].isLoopFrame).toBe(true);
    expect(flowState.transitions[0].fromFrameId).toBe("a");
    expect(flowState.transitions[0].toFrameId).toBe("b");
  });

  it("leaves an already-migrated session untouched", () => {
    const session = {
      id: "s1",
      name: "Session 1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      mode: "action" as const,
      flowState: { referenceFrames: [{ id: "a" }] },
      actionState: { images: [] },
    };

    const [migrated] = migrateSessions([session]);

    expect(migrated.mode).toBe("action");
    expect(migrated.actionState).toEqual({ images: [] });
    expect(
      (
        migrated.flowState as {
          referenceFrames: Array<Record<string, unknown>>;
        }
      ).referenceFrames,
    ).toHaveLength(1);
  });
});

describe("studio-mode migration v1 → v2 (#729)", () => {
  it("maps a stored batch mode onto action", () => {
    expect(migrateStudioMode({ mode: "batch" })).toEqual({ mode: "action" });
    expect(migrateStudioMode({ mode: "flow" })).toEqual({ mode: "flow" });
    expect(migrateStudioMode({ mode: "action" })).toEqual({ mode: "action" });
  });
});
