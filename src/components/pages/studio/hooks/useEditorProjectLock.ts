import { useCallback, useEffect, useState } from "react";
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

export const useEditorProjectLock = (projectUuid?: string) => {
  const { socket } = useSocket();
  const [status, setStatus] = useState<ProjectLockStatus>("idle");
  const [lockedAt, setLockedAt] = useState<string | null>(null);

  const claim = useCallback(async (uuid: string, force = false) => {
    try {
      await claimEditorProjectLock(uuid, force);
      setLockedAt(null);
      setStatus("held");
    } catch (error) {
      if (isProjectLocked(error)) {
        setLockedAt(error.lockedAt ?? null);
        setStatus("blocked");
        return;
      }
      Bugsnag.notify(error as Error);
      setStatus("held");
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
        setLockedAt(null);
        setStatus("held");
        return;
      }

      setLockedAt(state.lockedAt);
      setStatus("blocked");
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
      setStatus("idle");
      return;
    }

    setStatus("claiming");
    void claim(projectUuid);
    const timer = setInterval(() => void claim(projectUuid), LOCK_HEARTBEAT_MS);

    return () => clearInterval(timer);
  }, [projectUuid, claim]);

  const takeOver = useCallback(() => {
    if (!projectUuid) return;
    void claim(projectUuid, true);
  }, [projectUuid, claim]);

  return { status, lockedAt, takeOver };
};
