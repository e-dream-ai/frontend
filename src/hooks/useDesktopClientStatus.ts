import { useEffect, useState } from "react";
import { REMOTE_CONTROLS } from "@/constants/remote-control.constants";
import {
  RemoteControlAction,
  RemoteControlEvent,
} from "@/types/remote-control.types";
import { getRemoteControlEvent } from "@/utils/remote-control.util";
import useRemoteControlSocket from "./useRemoteControlSocket";

/**
 *
 * @param inactivityTimeout ms timeout
 * @returns
 */
export const useDesktopClientStatus = (
  inactivityTimeout: number = 5 * 1000,
) => {
  const [lastEventTime, setLastEventTime] = useState<number>(Date.now());

  const [isActive, setIsActive] = useState<boolean>(false);
  const handleRemoteControlEvent = (data?: RemoteControlEvent): void => {
    const event: RemoteControlAction | undefined = getRemoteControlEvent(
      data?.event,
    );

    if (!event) {
      return;
    }

    if (event.event === REMOTE_CONTROLS.DESKTOP_CLIENT.event) {
      setIsActive(true);
      setLastEventTime(Date.now());
    }
  };

  /**
   * Handle new remote control events from the server for dream on profile
   */
  useRemoteControlSocket(handleRemoteControlEvent);

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
