import { useEffect } from "react";
import { NEW_REMOTE_CONTROL_EVENT } from "@/constants/remote-control.constants";
import { RemoteControlEvent } from "@/types/remote-control.types";
import useSocket from "./useSocket";

type HandleRemoteControlEvent = (data?: RemoteControlEvent) => void;

const useRemoteControlSocket = (
  handleRemoteControlEvent: HandleRemoteControlEvent,
) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket?.on(NEW_REMOTE_CONTROL_EVENT, handleRemoteControlEvent);

    const offEvent = () => {
      socket?.off(NEW_REMOTE_CONTROL_EVENT, handleRemoteControlEvent);
    };

    // Cleanup function to remove event listener when unmounting
    return offEvent;
  }, [socket, handleRemoteControlEvent]);

  return;
};

export default useRemoteControlSocket;
