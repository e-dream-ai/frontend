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
import { refreshAccessToken } from "@/hooks/useHttpInterceptors";

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
  const { user, setLoggedUser } = useAuth();

  const [isConnected, setIsConnected] = useState<boolean>(false);
  /**
   * ref to save socket instance
   */
  const socketRef = useRef<Socket>();

  /**
   * ref to save previous token value
   */
  const prevTokenRef = useRef<string | undefined>();
  const accessToken = useMemo(() => user?.token?.AccessToken, [user]);

  const generateSocketInstance = useCallback(
    (accessToken: string) => {
      const newSocket = socketIO(`${SOCKET_URL}/${REMOTE_CONTROL_NAMESPACE}`, {
        query: {
          token: accessToken ? `Bearer ${accessToken}` : "",
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

      // Listen to connect event only once
      newSocket.on("connect", () => {
        // Socket connected
        setIsConnected(true);
      });

      // Handle disconnection
      newSocket.on("disconnect", () => {
        // Socket disconnected
        setIsConnected(false);

        /**
         * if there's user and socket turns off, refresh user and token
         */
        if (user) {
          refreshAccessToken({ user, handleRefreshUser: setLoggedUser });
        }
      });

      // Handle connection error
      newSocket.on("connect_error", (error) => {
        // Connection error {error}
        setIsConnected(false);
        /**
         * if there's user and received unauthorized from backend, refresh user and token
         */
        if (user && error.message === SOCKET_AUTH_ERROR_MESSAGES.UNAUTHORIZED) {
          refreshAccessToken({ user, handleRefreshUser: setLoggedUser });
        }
      });

      // Handle reconnecting attempts
      newSocket.on("reconnecting", (/* attemptNumber */) => {});

      // Handle reconnection success
      newSocket.on("reconnect", (/* attemptNumber */) => {
        setIsConnected(true);
      });

      return newSocket;
    },
    [user, setLoggedUser],
  );

  useEffect(() => {
    if (accessToken && accessToken !== prevTokenRef.current) {
      socketRef.current = generateSocketInstance(accessToken);
    }

    // Update the ref to the current token
    prevTokenRef.current = accessToken;

    return () => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current?.disconnect();
        socketRef.current = undefined;
      }
    };
  }, [accessToken, generateSocketInstance]);

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
