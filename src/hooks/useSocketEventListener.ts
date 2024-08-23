import { useEffect } from "react";
import useSocket from "./useSocket";

type EventListener<T> = (data?: T) => void;

const useSocketEventListener = <T>(
  event: string,
  listener: EventListener<T>,
) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket?.on(event, listener);

    const offEvent = () => {
      socket?.off(event, listener);
    };

    // Cleanup function to remove event listener when unmounting
    return offEvent;
  }, [socket, event, listener]);

  return;
};

export default useSocketEventListener;
