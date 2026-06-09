import { describe, it, expect, beforeEach } from "vitest";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

import { useSessionStore } from "./session.store";

describe("session store", () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({ sessions: [], activeSessionId: null });
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

  it("duplicates a session", () => {
    useSessionStore.getState().createSession("Original");
    const { sessions } = useSessionStore.getState();
    useSessionStore.getState().duplicateSession(sessions[0].id);
    const updated = useSessionStore.getState().sessions;
    expect(updated).toHaveLength(2);
    expect(updated[1].name).toBe("Original (copy)");
  });

  it("caps at MAX_SESSIONS", () => {
    for (let i = 0; i < 22; i++) {
      useSessionStore.getState().createSession(`Session ${i}`);
    }
    expect(useSessionStore.getState().sessions.length).toBeLessThanOrEqual(20);
  });
});
