import { describe, it, expect, beforeEach, beforeAll } from "vitest";

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

const { useSessionStore } = await import("./session.store");
const { useFlowStore } = await import("./flow.store");

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
      selectedTransitionIndex: 3,
      settingsExpanded: true,
      previewLightboxOpen: true,
    });

    const { sessions } = useSessionStore.getState();
    useSessionStore.getState().switchSession(sessions[0].id);

    const flowState = useFlowStore.getState();
    expect(flowState.selectedTransitionIndex).toBeNull();
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
