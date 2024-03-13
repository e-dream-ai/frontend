import React, { createContext, useEffect, useMemo, useState } from "react";
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

  const generateSocketInstance = (user: UserWithToken) => {
    // Connect to Socket.IO server
    const newSocket = socketIO(`${SOCKET_URL}/${REMOTE_CONTROL_NAMESPACE}`, {
      query: {
        token: user?.token?.AccessToken
          ? `Bearer ${user?.token?.AccessToken}`
          : "",
      },
    });

    // Store the socket instance
    setSocket(newSocket);

    newSocket.on("connect", () => {
      // Access session ID when connected
      setSessionId(newSocket.id);
    });

    return newSocket;
  };

  useEffect(() => {
    console.log({ user });
    if (!user) {
      return;
    }
    const newSocket = generateSocketInstance(user);
    return () => {
      newSocket?.disconnect();
    };
  }, [user]);

  const memoedValue = useMemo(
    () => ({ socket, sessionId }),
    [socket, sessionId],
  );

  return (
    <SocketContext.Provider value={memoedValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
