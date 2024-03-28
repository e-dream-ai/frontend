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

  const generateSocketInstance = useCallback((user: UserWithToken) => {
    const newSocket = socketIO(`${SOCKET_URL}/${REMOTE_CONTROL_NAMESPACE}`, {
      query: {
        token: user?.token?.AccessToken
          ? `Bearer ${user?.token?.AccessToken}`
          : "",
      },
    });

    // Listen to connect event only once
    newSocket.on("connect", () => {
      console.log({ newSocket });
      console.log(newSocket.connected);
      setSocket(newSocket);
      setSessionId(newSocket.id);
    });
  }, []);

  useEffect(() => {
    if (user) {
      generateSocketInstance(user);
    }
  }, [user, generateSocketInstance]);

  useEffect(() => {
    return () => {
      if (socket && socket.connected) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // useMemo to memoize context value
  const contextValue = useMemo(
    () => ({ socket, sessionId }),
    [socket, sessionId],
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
