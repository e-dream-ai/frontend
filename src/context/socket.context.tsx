import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import socketIO, { Socket } from "socket.io-client";
import useAuth from "@/hooks/useAuth";
import { SOCKET_URL } from "@/constants/api.constants";
import { SOCKET_AUTH_ERROR_MESSAGES } from "@/constants/auth.constants";
import { EmitEvents, EmitListener } from "@/types/socket.types";

type SocketContextType = {
  socket?: Socket | null;
  isConnected: boolean;
  connectedDevicesCount?: number;
  hasWebPlayer?: boolean;
  emit: <Ev extends keyof EmitEvents>(
    ev: Ev,
    ...args: Parameters<EmitEvents[Ev]>
  ) => void;
  addEmitListener: (listener: EmitListener) => void;
  removeEmitListener: (listener: EmitListener) => void;
};

export const SocketContext = createContext<SocketContextType>(
  {} as SocketContextType,
);

const REMOTE_CONTROL_NAMESPACE = "remote-control";

// socket.io's native reconnection backoff bounds. delayMax caps the steady-state
// retry interval, so it also bounds how long recovery takes once the backend is back.
const RECONNECTION_DELAY_MS = 1_000;
const RECONNECTION_DELAY_MAX_MS = 5_000;
// min gap between cookie refreshes, so a rejected socket can't spin on /authenticate
const REAUTH_COOLDOWN_MS = 10_000;

export const SocketProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { user, authenticateUser } = useAuth();
  const userUuid = user?.uuid;
  const [socket, setSocket] = useState<Socket | null>(null);

  const isConnected = useSyncExternalStore(
    useCallback(
      (onStoreChange: () => void) => {
        socket?.on("connect", onStoreChange);
        socket?.on("disconnect", onStoreChange);
        window.addEventListener("online", onStoreChange);
        window.addEventListener("offline", onStoreChange);
        return () => {
          socket?.off("connect", onStoreChange);
          socket?.off("disconnect", onStoreChange);
          window.removeEventListener("online", onStoreChange);
          window.removeEventListener("offline", onStoreChange);
        };
      },
      [socket],
    ),
    () => (socket?.connected ?? false) && navigator.onLine,
  );
  const [connectedDevicesCount, setConnectedDevicesCount] = useState<number>(0);
  const [hasWebPlayer, setHasWebPlayer] = useState<boolean>(false);

  // ref to save socket instance
  const socketRef = useRef<Socket | null>();

  // latest cookie-refresh handler, called from the stable socket listeners
  const refreshAuthRef = useRef<() => void>();

  // guards so re-auth can't run concurrently or too often
  const reauthInFlight = useRef(false);
  const lastReauthAt = useRef(0);

  const emitListeners = React.useRef<Set<EmitListener>>(new Set());

  const generateSocketInstance = useCallback(() => {
    const newSocket = socketIO(`${SOCKET_URL}/${REMOTE_CONTROL_NAMESPACE}`, {
      timeout: 5 * 1000,
      // socket.io owns reconnection: infinite retries with native backoff + jitter,
      // re-sending the cookie each attempt. Expired-cookie case handled below.
      reconnectionAttempts: Infinity,
      reconnectionDelay: RECONNECTION_DELAY_MS,
      reconnectionDelayMax: RECONNECTION_DELAY_MAX_MS,
      withCredentials: true,
      transports: ["websocket"],
      extraHeaders: {
        "Edream-Client-Type": "react",
        "Edream-Client-Version": import.meta.env.VITE_COMMIT_REF,
      },
    });

    newSocket.on("connect_error", (error) => {
      // only auth failures need us — socket.io can't refresh an expired cookie;
      // everything else is connectivity it retries on its own
      if (error.message === SOCKET_AUTH_ERROR_MESSAGES.UNAUTHORIZED) {
        refreshAuthRef.current?.();
      }
    });

    // Listen presence updates
    newSocket.on(
      "client_presence",
      (payload: { connectedDevices?: number; hasWebPlayer?: boolean }) => {
        const count = Number(payload?.connectedDevices ?? 0);
        if (Number.isFinite(count))
          setConnectedDevicesCount(Math.max(0, count));
        setHasWebPlayer(Boolean(payload?.hasWebPlayer));
      },
    );

    return newSocket;
  }, []);

  const teardownSocket = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;
    try {
      socket.removeAllListeners();
      socket.disconnect();
    } catch {
      // ignore teardown errors on the stale socket
    }
    socketRef.current = null;
  }, []);

  // refresh the cookie on UNAUTHORIZED, then let socket.io reconnect with it.
  // a hard 401 logs out via the axios interceptor, tearing the socket down below.
  const refreshAuthAndReconnect = useCallback(async () => {
    if (!user) return;
    if (reauthInFlight.current) return;
    if (Date.now() - lastReauthAt.current < REAUTH_COOLDOWN_MS) return;

    reauthInFlight.current = true;
    try {
      await authenticateUser();
      // nudge an immediate attempt with the refreshed cookie
      socketRef.current?.connect();
    } finally {
      lastReauthAt.current = Date.now();
      reauthInFlight.current = false;
    }
  }, [user, authenticateUser]);

  refreshAuthRef.current = refreshAuthAndReconnect;

  // on regaining focus/network, retry now instead of waiting out the backoff
  const nudgeReconnect = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || socket.connected) return;
    socket.connect();
  }, []);

  const addEmitListener = useCallback((listener: EmitListener) => {
    emitListeners.current.add(listener);
  }, []);

  const removeEmitListener = useCallback((listener: EmitListener) => {
    emitListeners.current.delete(listener);
  }, []);

  const emit = useCallback(
    <Ev extends keyof EmitEvents>(
      ev: Ev,
      ...args: Parameters<EmitEvents[Ev]>
    ) => {
      // notify listeners
      emitListeners.current.forEach((listener) => {
        // @ts-expect-error unknonw type error on args
        listener(ev, ...args);
      });
      // emit to socket
      socketRef.current?.emit(ev, ...args);
    },
    [],
  );

  useEffect(() => {
    // if there's user generate instance
    socketRef.current = userUuid ? generateSocketInstance() : null;
    setSocket(socketRef.current);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        nudgeReconnect();
      }
    };

    const handleOnline = () => {
      nudgeReconnect();
    };

    // Add event listener for when the tab becomes visible or focus
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", nudgeReconnect);
    // Add event listener for when window online status is active
    window.addEventListener("online", handleOnline);
    return () => {
      // Remove socket listeners, disconnect socket and set socketRef to null
      teardownSocket();

      // Clean ups functions to prevent execute them when are no longer needed
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", nudgeReconnect);
      window.removeEventListener("online", handleOnline);
    };
  }, [userUuid, generateSocketInstance, nudgeReconnect, teardownSocket]);

  // useMemo to memoize context value
  const contextValue = useMemo(
    () => ({
      socket,
      isConnected,
      connectedDevicesCount,
      hasWebPlayer,
      emit,
      addEmitListener,
      removeEmitListener,
    }),
    [
      socket,
      isConnected,
      connectedDevicesCount,
      hasWebPlayer,
      emit,
      addEmitListener,
      removeEmitListener,
    ],
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
