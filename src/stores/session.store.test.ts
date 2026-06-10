import { describe, it, expect, beforeEach, beforeAll } from "vitest";

// Polyfill localStorage for Node environment (must run before store imports)
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

// Dynamic imports after localStorage is set up (persist middleware needs it)
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
    // Create two sessions
    useSessionStore.getState().createSession("Session A");
    useSessionStore.getState().createSession("Session B");

    // Simulate stale UI state in the flow store (as if user selected transition 3)
    useFlowStore.setState({
      selectedTransitionIndex: 3,
      settingsExpanded: true,
      previewLightboxOpen: true,
    });

    // Switch back to Session A
    const { sessions } = useSessionStore.getState();
    useSessionStore.getState().switchSession(sessions[0].id);

    // UI state should be reset to defaults, not carried over from previous session
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
    // Active session is "Second" (most recently created)
    expect(useSessionStore.getState().activeSessionId).toBe(sessions[1].id);

    // Delete the active session
    useSessionStore.getState().deleteSession(sessions[1].id);

    // Should switch to the remaining session
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
    // The newest session should still be present
    expect(sessions[sessions.length - 1].name).toBe("Session 21");
  });

  it("saves and restores flow state across sessions", () => {
    // Create session A and set some flow state
    useSessionStore.getState().createSession("Session A");
    useFlowStore.setState({ globalPrompt: "hello from A" });
    useSessionStore.getState().saveCurrentSession();

    // Create session B with different state
    useSessionStore.getState().createSession("Session B");
    useFlowStore.setState({ globalPrompt: "hello from B" });
    useSessionStore.getState().saveCurrentSession();

    // Switch back to A — flow state should restore
    const { sessions } = useSessionStore.getState();
    useSessionStore.getState().switchSession(sessions[0].id);
    expect(useFlowStore.getState().globalPrompt).toBe("hello from A");

    // Switch back to B
    useSessionStore.getState().switchSession(sessions[1].id);
    expect(useFlowStore.getState().globalPrompt).toBe("hello from B");
  });
});
