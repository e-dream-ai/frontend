import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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

// socket.io's own reconnection handles connectivity loss with built-in
// exponential backoff + jitter; these tune how gentle it stays on a long
// backend outage (default delayMax is 5s, which is a bit hot for a fleet).
const RECONNECTION_DELAY_MS = 1_000;
const RECONNECTION_DELAY_MAX_MS = 30_000;
// Minimum gap between cookie refreshes, so a persistently rejected socket
// can't hammer /authenticate.
const REAUTH_COOLDOWN_MS = 10_000;

export const SocketProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { user, authenticateUser } = useAuth();

  // boolean flag on state to know if socket is connected
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedDevicesCount, setConnectedDevicesCount] = useState<number>(0);
  const [hasWebPlayer, setHasWebPlayer] = useState<boolean>(false);

  // ref to save socket instance
  const socketRef = useRef<Socket | null>();

  /**
   * latest cookie-refresh handler, called from the (stable) socket listeners.
   * a ref because `generateSocketInstance` is intentionally stable but the
   * handler closes over the current `user`/`authenticateUser`.
   */
  const refreshAuthRef = useRef<() => void>();

  // guards so re-auth can't run concurrently or spin on /authenticate
  const reauthInFlight = useRef(false);
  const lastReauthAt = useRef(0);

  const emitListeners = React.useRef<Set<EmitListener>>(new Set());

  const generateSocketInstance = useCallback(() => {
    const newSocket = socketIO(`${SOCKET_URL}/${REMOTE_CONTROL_NAMESPACE}`, {
      /**
       * 5 seconds timeout
       */
      timeout: 5 * 1000,
      /**
       * Let socket.io own reconnection: it retries indefinitely with built-in
       * exponential backoff + jitter, re-sending the auth cookie on every
       * attempt. We previously capped this at 2 and ran a manual rebuild loop,
       * which bypassed the backoff entirely and hammered the server while the
       * backend was down. The only thing socket.io can't recover from on its
       * own is an expired cookie (it would retry forever with the dead one) —
       * that's handled in the `connect_error` UNAUTHORIZED branch below.
       */
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

    setIsConnected(newSocket.connected);

    // "connect" fires on the initial connection and on every reconnection
    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    // Listen disconnection event
    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Handle connection error
    newSocket.on("connect_error", (error) => {
      setIsConnected(false);

      /**
       * Only auth failures need our intervention. socket.io can't refresh an
       * expired session cookie on its own, so it would retry forever with the
       * dead cookie — refresh it and let the next reconnection attempt use it.
       * Every other error is connectivity, which socket.io's backoff handles.
       */
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
      // Prevent listeners execute functions
      socket.removeAllListeners();
      socket.disconnect();
    } catch {
      // ignore teardown errors on the stale socket
    }
    socketRef.current = null;
  }, []);

  /**
   * Refresh the session cookie when the socket is rejected as UNAUTHORIZED,
   * then let socket.io reconnect with it. Rate-limited so a persistently
   * rejected socket can't spin on /authenticate. A hard 401 logs the user out
   * (axios interceptor), which tears the socket down via the effect below.
   */
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

  /**
   * On regaining focus / network, nudge an immediate reconnect instead of
   * waiting out socket.io's current backoff delay (up to RECONNECTION_DELAY_MAX_MS).
   */
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
    socketRef.current = user ? generateSocketInstance() : null;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        nudgeReconnect();
      }
    };

    const handleOnline = () => {
      nudgeReconnect();
    };

    const handleOffline = () => {
      setIsConnected(false);
    };

    // Add event listener for when the tab becomes visible or focus
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Add event listener for when window online status is active
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      // Remove socket listeners, disconnect socket and set socketRef to null
      teardownSocket();

      // Clean ups functions to prevent execute them when are no longer needed
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user, generateSocketInstance, nudgeReconnect, teardownSocket]);

  // useMemo to memoize context value
  const contextValue = useMemo(
    () => ({
      socket: socketRef.current,
      isConnected,
      connectedDevicesCount,
      hasWebPlayer,
      emit,
      addEmitListener,
      removeEmitListener,
    }),
    [
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
