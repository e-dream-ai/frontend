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

export const SocketProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { user, authenticateUser } = useAuth();

  // boolean flag on state to know if socket is connected
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedDevicesCount, setConnectedDevicesCount] = useState<number>(0);
  const [hasWebPlayer, setHasWebPlayer] = useState<boolean>(false);

  /**
   * flag to prevent multiple simultaneous authentication attempts during socket reconnection
   * implemented as a ref (useRef) instead of state (useState) because changes to this flag shouldn't trigger re-renders
   * and need update value immediately in operations
   */
  const isReconnecting = useRef(false);

  // ref to save socket instance
  const socketRef = useRef<Socket | null>();

  const emitListeners = React.useRef<Set<EmitListener>>(new Set());

  const generateSocketInstance = useCallback(() => {
    // if there's no user don't create instance

    const newSocket = socketIO(`${SOCKET_URL}/${REMOTE_CONTROL_NAMESPACE}`, {
      /**
       * 5 seconds timeout
       */
      timeout: 5 * 1000,
      // default reconnectionAttempts value is Infinity, which could trigger socket reconnection requests to the server with expired auth cookie producing a loop after unauthorization
      // refresh session using authenticateUser to fetch fresh credentials and generate an new socket instance would work better
      // attempts limited to 2, continue under observation
      reconnectionAttempts: 2,
      withCredentials: true,
      transports: ["websocket"],
      extraHeaders: {
        "Edream-Client-Type": "react",
        "Edream-Client-Version": import.meta.env.VITE_COMMIT_REF,
      },
    });

    setIsConnected(newSocket.connected);

    // Listen connect event
    newSocket.on("connect", () => {
      // Socket connected
      setIsConnected(true);
    });

    // Listen disconnection event
    newSocket.on("disconnect", () => {
      // Socket disconnected
      setIsConnected(false);
    });

    // Handle connection error
    newSocket.on("connect_error", async (error) => {
      setIsConnected(false);

      /**
       * when a connect_error is triggered and the socket backend message is "UNAUTHORIZED"
       * the session cookie should be refreshed using `authenticateUser`
       * will cause user could get a fresh cookie and a new socket instance will be generated with the proper authorization
       */
      if (
        error.message === SOCKET_AUTH_ERROR_MESSAGES.UNAUTHORIZED &&
        !isReconnecting.current
      ) {
        try {
          isReconnecting.current = true;
          await authenticateUser();
        } finally {
          isReconnecting.current = false;
        }
      }
    });

    // Handle reconnection success
    newSocket.on("reconnect", (/* attemptNumber */) => {
      setIsConnected(true);
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
  }, [authenticateUser]);

  // Handle reconnection
  const handleReconnect = useCallback(async () => {
    // If we're already reconnecting, don't start another attempt
    if (isReconnecting.current) {
      return;
    }

    try {
      isReconnecting.current = true;

      if (socketRef.current) {
        // Tab focused and checking connection
        if (!socketRef.current.connected) {
          // Attempting to reconnect

          // Remove socket listeners, disconnect, fetch `/authenticate` and try a reconnection (refresh cookie session)
          // Prevent listeners execute functions
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
          socketRef.current = null;
          await authenticateUser();
        } else {
          // Socket already connected
        }
      }
    } finally {
      // Reset the flag when we're done
      isReconnecting.current = false;
    }
  }, [authenticateUser]);

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
        handleReconnect();
      }
    };

    const handleOnline = () => {
      handleReconnect();
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
      if (socketRef.current) {
        // Prevent listeners execute functions
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Clean ups functions to prevent execute them when are no longer needed
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [user, generateSocketInstance, handleReconnect]);

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
