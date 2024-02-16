import { useEffect, useState } from "react";
import socketIO, { Socket } from "socket.io-client";
import { SOCKET_URL } from "@/constants/api.constants";
import useAuth from "./useAuth";

const REMOTE_CONTROL_NAMESPACE = "remote-control";

export const useIO = () => {
  const { user } = useAuth();

  const [io, setIO] = useState<Socket>();

  useEffect(() => {
    if (user) {
      // Connect to Socket.IO server
      const ioInstance = socketIO(`${SOCKET_URL}/${REMOTE_CONTROL_NAMESPACE}`, {
        query: {
          token: user?.token?.AccessToken
            ? `Bearer ${user?.token?.AccessToken}`
            : "",
        },
      });
      setIO(ioInstance);
    }
  }, [user]);

  return { io };
};

export default useIO;
