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
import queryClient from "@/api/query-client";
import router from "@/routes/router";
import { ROUTES } from "@/constants/routes.constants";
import { SOCKET_URL } from "@/constants/api.constants";
import { SOCKET_AUTH_ERROR_MESSAGES } from "@/constants/auth.constants";

type SocketContextType = {
  socket?: Socket;
  isConnected: boolean;
};

export const SocketContext = createContext<SocketContextType>(
  {} as SocketContextType,
);

const REMOTE_CONTROL_NAMESPACE = "remote-control";

export const SocketProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { user, authenticateUser, logout } = useAuth();

  const [isConnected, setIsConnected] = useState<boolean>(false);
  /**
   * ref to save socket instance
   */
  const socketRef = useRef<Socket>();

  const generateSocketInstance = useCallback(() => {
    const newSocket = socketIO(`${SOCKET_URL}/${REMOTE_CONTROL_NAMESPACE}`, {
      /**
       * 5 seconds timeout
       */
      timeout: 5 * 1000,
      withCredentials: true,
    });

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
       * if there's user and received unauthorized
       */
      if (user && error.message === SOCKET_AUTH_ERROR_MESSAGES.UNAUTHORIZED) {
        // Handle unauthorized error
        queryClient.clear();
        await logout();
        router.navigate(ROUTES.LOGIN);
      }
    });

    // Handle reconnecting attempts
    newSocket.on("reconnecting", (/* attemptNumber */) => {});

    // Handle reconnection success
    newSocket.on("reconnect", (/* attemptNumber */) => {
      setIsConnected(true);
    });

    return newSocket;
  }, [user, logout]);

  useEffect(() => {
    socketRef.current = generateSocketInstance();

    // Handle reconnection
    const handleReconnect = async () => {
      if (socketRef.current) {
        // Tab focused and checking connection
        if (!socketRef.current.connected) {
          // Attempting to reconnect
          socketRef.current.disconnect();
          await authenticateUser();
          socketRef.current.connect();
        } else {
          // Socket already connected
        }
      }
    };

    // Add event listener for when the tab becomes visible
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        handleReconnect();
      }
    });

    return () => {
      // Disconnect socket and set socketRef to undefined
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current?.disconnect();
        socketRef.current = undefined;
      }

      // Clean up function
      document.removeEventListener("visibilitychange", handleReconnect);
    };
  }, [user, authenticateUser, generateSocketInstance]);

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
