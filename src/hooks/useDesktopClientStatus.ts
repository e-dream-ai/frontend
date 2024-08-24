import { useEffect, useState } from "react";
import { PING_EVENT } from "@/constants/remote-control.constants";
import useSocketEventListener from "./useSocketEventListener";

/**
 *
 * @param inactivityTimeout ms timeout
 * @returns
 */
export const useDesktopClientStatus = (
  inactivityTimeout: number = 60 * 1000,
) => {
  const [lastEventTime, setLastEventTime] = useState<number>(Date.now());

  const [isActive, setIsActive] = useState<boolean>(false);
  const handlePingEvent = (): void => {
    setIsActive(true);
    setLastEventTime(Date.now());
  };

  /**
   * Handle new remote control events from the server for dream on profile
   */
  useSocketEventListener(PING_EVENT, handlePingEvent);

  useEffect(() => {
    const inactivityTimer = setTimeout(() => {
      if (Date.now() - lastEventTime >= inactivityTimeout) {
        setIsActive(false);
      }
    }, inactivityTimeout);

    return () => clearTimeout(inactivityTimer);
  }, [lastEventTime, inactivityTimeout]);

  return { isActive };
};
