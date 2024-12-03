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

type SocketContextType = {
  socket?: Socket | null;
  isConnected: boolean;
};

export const SocketContext = createContext<SocketContextType>(
  {} as SocketContextType,
);

const REMOTE_CONTROL_NAMESPACE = "remote-control";

export const SocketProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { user, authenticateUser } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const isReconnecting = useRef(false);

  /**
   * ref to save socket instance
   */
  const socketRef = useRef<Socket | null>();

  const generateSocketInstance = useCallback(() => {
    /**
     * If there's no user don't create instance
     */
    if (!user) {
      return;
    }

    const newSocket = socketIO(`${SOCKET_URL}/${REMOTE_CONTROL_NAMESPACE}`, {
      /**
       * 5 seconds timeout
       */
      timeout: 5 * 1000,
      withCredentials: true,
      extraHeaders: {
        "Edream-Client-Type": "react",
        "Edream-Client-Version": import.meta.env.VITE_COMMIT_REF,
      },
    });

    setIsConnected(newSocket.connected);

    // Listen to connect event only once
    newSocket.on("connect", () => {
      // Socket connected
      setIsConnected(true);
    });

    // Handle disconnection
    newSocket.on("disconnect", () => {
      // Socket disconnected
      setIsConnected(false);
    });

    // Handle connection error
    newSocket.on("connect_error", async (error) => {
      // Connection error {error}
      setIsConnected(false);
      /**
       * If there's user and receives unauthorized handle logout
       *
       * Temporarily commented, after online status is activated or visibilitychange is triggered,
       * an attempt will be made to make a request to the v2/auth/authenticate endpoint to validate the session.
       * If backend sends a 401 using authenticateUser, axios interceptor is in charge of logout and redirect to login.
       */

      if (
        user &&
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

    // Handle reconnecting attempts
    newSocket.on("reconnecting", (/* attemptNumber */) => {});

    // Handle reconnection success
    newSocket.on("reconnect", (/* attemptNumber */) => {
      setIsConnected(true);
    });

    return newSocket;
  }, [user, authenticateUser]);

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
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
          socketRef.current = null;
          await authenticateUser();
          // socketRef.current.connect();
        } else {
          // Socket already connected
        }
      }
    } finally {
      // Reset the flag when we're done
      isReconnecting.current = false;
    }
  }, [authenticateUser]);

  useEffect(() => {
    socketRef.current = generateSocketInstance();

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
      // Disconnect socket and set socketRef to undefined
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Clean up function
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [generateSocketInstance, handleReconnect]);

  // useMemo to memoize context value
  const contextValue = useMemo(
    () => ({ socket: socketRef.current, isConnected }),
    [isConnected],
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
