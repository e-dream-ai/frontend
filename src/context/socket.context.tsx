import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import socketIO, { Socket } from "socket.io-client";
import useAuth from "@/hooks/useAuth";
import { UserWithToken } from "@/types/auth.types";
import { SOCKET_URL } from "@/constants/api.constants";

type SocketContextType = {
  socket?: Socket;
  sessionId?: string;
  isConnected: boolean;
};

export const SocketContext = createContext<SocketContextType>(
  {} as SocketContextType,
);

const REMOTE_CONTROL_NAMESPACE = "remote-control";

export const SocketProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();

  const [socket, setSocket] = useState<Socket>();
  const [sessionId, setSessionId] = useState<string>();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const generateSocketInstance = useCallback((user: UserWithToken) => {
    const newSocket = socketIO(`${SOCKET_URL}/${REMOTE_CONTROL_NAMESPACE}`, {
      query: {
        token: user?.token?.AccessToken
          ? `Bearer ${user?.token?.AccessToken}`
          : "",
      },
      /**
       * 3 seconds timeout
       */
      timeout: 3 * 1000,
      /**
       * no attemps
       */
      reconnectionAttempts: 0,
    });

    setIsConnecting(true);

    // Listen to connect event only once
    newSocket.on("connect", () => {
      // Socket connected
      console.log(newSocket, newSocket.id);
      setSocket(newSocket);
      setSessionId(newSocket.id);
      setIsConnected(true);
    });

    // Handle disconnection
    newSocket.on("disconnect", () => {
      // Socket disconnected
      setIsConnected(false);
    });

    // Handle connection error
    newSocket.on("connect_error", (/* error */) => {
      // Connection error {error}
      setIsConnected(false);
      setIsConnecting(false);
    });

    // Handle reconnecting attempts
    newSocket.on("reconnecting", (/* attemptNumber */) => {
      // Reconnecting attempt {attemptNumber}
    });

    // Handle reconnection success
    newSocket.on("reconnect", (/* attemptNumber */) => {
      // Reconnected on attempt {attemptNumber}
      setIsConnected(true);
    });
  }, []);

  useEffect(() => {
    if (user && !isConnecting && !socket) {
      generateSocketInstance(user);
    }
  }, [user, socket, isConnecting, generateSocketInstance]);

  useEffect(() => {
    return () => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // useMemo to memoize context value
  const contextValue = useMemo(
    () => ({ socket, sessionId, isConnected }),
    [socket, sessionId, isConnected],
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
