import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { axiosClient } from "@/client/axios.client";
import { ContentType, getRequestHeaders } from "@/constants/auth.constants";

export const LOCK_HEARTBEAT_MS = 30_000;

const SESSION_ID_KEY = "editor-session-id";

const readSessionId = () => {
  try {
    const stored = window.sessionStorage.getItem(SESSION_ID_KEY);
    if (stored) return stored;

    const created = uuidv4();
    window.sessionStorage.setItem(SESSION_ID_KEY, created);
    return created;
  } catch {
    return uuidv4();
  }
};

export const EDITOR_SESSION_ID = readSessionId();

export type EditorProjectLockState = {
  uuid: string;
  lockedBy: string | null;
  lockedAt: string | null;
};

export class EditorProjectLockedError extends Error {
  readonly lockedAt?: string | null;

  constructor(lockedAt?: string | null) {
    super("This project is already open somewhere else.");
    this.name = "EditorProjectLockedError";
    this.lockedAt = lockedAt;
  }
}

export const isProjectLocked = (
  error: unknown,
): error is EditorProjectLockedError =>
  error instanceof EditorProjectLockedError;

const lockPath = (uuid: string) => `/v2/editor-projects/${uuid}/lock`;

export const claimEditorProjectLock = async (uuid: string, force = false) => {
  try {
    await axiosClient.put(
      lockPath(uuid),
      { sessionId: EDITOR_SESSION_ID, force },
      { headers: getRequestHeaders({ contentType: ContentType.json }) },
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 423) {
      const data = error.response.data as
        | { data?: { lock?: { lockedAt?: string | null } } }
        | undefined;
      throw new EditorProjectLockedError(data?.data?.lock?.lockedAt);
    }
    throw error;
  }
};

export const releaseEditorProjectLock = (uuid: string) =>
  axiosClient.delete(lockPath(uuid), {
    params: { sessionId: EDITOR_SESSION_ID },
  });

export const releaseEditorProjectLockOnUnload = (uuid: string) => {
  void axiosClient
    .delete(lockPath(uuid), {
      params: { sessionId: EDITOR_SESSION_ID },
      adapter: "fetch",
      fetchOptions: { keepalive: true },
    })
    .catch(() => {});
};
