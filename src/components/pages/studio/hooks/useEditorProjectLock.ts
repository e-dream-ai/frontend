import { useCallback, useEffect, useReducer } from "react";
import Bugsnag from "@bugsnag/js";
import useSocket from "@/hooks/useSocket";
import {
  EDITOR_PROJECT_LOCK_EVENT,
  JOIN_EDITOR_PROJECT_EVENT,
  LEAVE_EDITOR_PROJECT_EVENT,
} from "@/constants/remote-control.constants";
import {
  claimEditorProjectLock,
  EDITOR_SESSION_ID,
  EditorProjectLockState,
  isProjectLocked,
  LOCK_HEARTBEAT_MS,
  releaseEditorProjectLock,
  releaseEditorProjectLockOnUnload,
} from "@/api/editor-project/editor-project-lock";

export type ProjectLockStatus = "idle" | "claiming" | "held" | "blocked";

type LockState = {
  status: ProjectLockStatus;
  lockedAt: string | null;
  interrupted: boolean;
};

type LockAction =
  | { type: "idle" }
  | { type: "claiming" }
  | { type: "held" }
  | { type: "blocked"; lockedAt: string | null };

const INITIAL_STATE: LockState = {
  status: "idle",
  lockedAt: null,
  interrupted: false,
};

const lockReducer = (state: LockState, action: LockAction): LockState => {
  switch (action.type) {
    case "idle":
      return INITIAL_STATE;
    case "claiming":
      return { ...state, status: "claiming" };
    case "held":
      return { status: "held", lockedAt: null, interrupted: false };
    case "blocked":
      return {
        status: "blocked",
        lockedAt: action.lockedAt,
        interrupted: state.status === "held",
      };
  }
};

export const useEditorProjectLock = (projectUuid?: string) => {
  const { socket } = useSocket();
  const [lock, dispatch] = useReducer(lockReducer, INITIAL_STATE);

  const claim = useCallback(async (uuid: string, force = false) => {
    try {
      await claimEditorProjectLock(uuid, force);
      dispatch({ type: "held" });
    } catch (error) {
      if (isProjectLocked(error)) {
        dispatch({ type: "blocked", lockedAt: error.lockedAt ?? null });
        return;
      }
      Bugsnag.notify(error as Error);
      dispatch({ type: "held" });
    }
  }, []);

  useEffect(() => {
    if (!projectUuid) return;

    const release = () => releaseEditorProjectLockOnUnload(projectUuid);
    window.addEventListener("pagehide", release);

    return () => {
      window.removeEventListener("pagehide", release);
      void releaseEditorProjectLock(projectUuid).catch(() => {});
    };
  }, [projectUuid]);

  useEffect(() => {
    if (!socket || !projectUuid) return;

    const join = () =>
      socket.emit(JOIN_EDITOR_PROJECT_EVENT, {
        uuid: projectUuid,
        sessionId: EDITOR_SESSION_ID,
      });

    const onLockChange = (state: EditorProjectLockState) => {
      if (state.uuid !== projectUuid) return;

      if (!state.lockedBy) {
        void claim(projectUuid);
        return;
      }

      if (state.lockedBy === EDITOR_SESSION_ID) {
        dispatch({ type: "held" });
        return;
      }

      dispatch({ type: "blocked", lockedAt: state.lockedAt });
    };

    join();
    socket.on("connect", join);
    socket.on(EDITOR_PROJECT_LOCK_EVENT, onLockChange);

    return () => {
      socket.off("connect", join);
      socket.off(EDITOR_PROJECT_LOCK_EVENT, onLockChange);
      socket.emit(LEAVE_EDITOR_PROJECT_EVENT, { uuid: projectUuid });
    };
  }, [socket, projectUuid, claim]);

  useEffect(() => {
    if (!projectUuid) {
      dispatch({ type: "idle" });
      return;
    }

    dispatch({ type: "claiming" });
    void claim(projectUuid);
    const timer = setInterval(() => void claim(projectUuid), LOCK_HEARTBEAT_MS);

    return () => clearInterval(timer);
  }, [projectUuid, claim]);

  const takeOver = useCallback(() => {
    if (!projectUuid) return;
    void claim(projectUuid, true);
  }, [projectUuid, claim]);

  return { ...lock, takeOver };
};
