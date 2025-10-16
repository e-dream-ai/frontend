import { createContext, useEffect, useState } from "react";
import {
  GOOD_BYE_EVENT,
  PING_EVENT,
} from "@/constants/remote-control.constants";
import useAuth from "@/hooks/useAuth";
import useSocketEventListener from "@/hooks/useSocketEventListener";

// Create context
type DesktopClientContextType = {
  isActive: boolean;
};

const DesktopClientContext = createContext<
  DesktopClientContextType | undefined
>(undefined);

/**
 * Create provider component
 * @param inactivityTimeout ms timeout
 */
export const DesktopClientProvider = ({
  children,
  inactivityTimeout = 60 * 1000,
}: {
  children: React.ReactNode;
  inactivityTimeout?: number;
}) => {
  const { user } = useAuth();
  const [lastEventTime, setLastEventTime] = useState<number | undefined>();
  const [isActive, setIsActive] = useState<boolean>(false);

  /**
   * Handle ping event, set to active status when it arrives
   */
  const handlePingEvent = async (): Promise<void> => {
    setIsActive(true);
    const now = Date.now();
    setLastEventTime(now);
  };

  /**
   * Handle goodbye event, set to inactive status when it arrives
   */
  const handleGoodbyeEvent = async (): Promise<void> => {
    setIsActive(false);
    setLastEventTime(undefined);
  };

  /**
   * Handle new remote control events from the server for dream on profile
   */
  useSocketEventListener(PING_EVENT, handlePingEvent);
  useSocketEventListener(GOOD_BYE_EVENT, handleGoodbyeEvent);

  /**
   * Setup timer from socket
   */
  useEffect(() => {
    /**
     * If there's no last event time, return early
     */
    if (!lastEventTime) {
      return;
    }

    /**
     * Set up an inactivity timer using `setTimeout`.
     * The timer will trigger after the specified `inactivityTimeout`
     * Set isActive state after inn
     */
    const inactivityTimer = setTimeout(() => {
      const now = Date.now();
      /**
       * Check if the current time minus the last event time is greater than or equal to the inactivity timeout
       * If true client is not connected
       */
      if (now - lastEventTime >= inactivityTimeout) {
        setIsActive(false);
      }
    }, inactivityTimeout);

    // Clean up the timer
    return () => clearTimeout(inactivityTimer);
  }, [lastEventTime, inactivityTimeout]);

  /**
   * Setup timer from server
   */
  useEffect(() => {
    const now = Date.now();
    /**
     * Take last ping time from user api data
     */
    const lastPingTime = user?.last_client_ping_at
      ? new Date(user.last_client_ping_at).getTime()
      : null;

    if (!lastPingTime) {
      return;
    }

    setLastEventTime(lastPingTime);

    const timeSinceLastPing = now - lastPingTime;
    const isCurrentlyActive = timeSinceLastPing < inactivityTimeout;

    setIsActive(isCurrentlyActive);

    let inactivityTimer: NodeJS.Timeout;

    if (isCurrentlyActive) {
      const remainingActiveTime = inactivityTimeout - timeSinceLastPing;
      inactivityTimer = setTimeout(
        () => setIsActive(false),
        remainingActiveTime,
      );
    }

    // Clean up the timer
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
    };
  }, [user, inactivityTimeout]);

  return (
    <DesktopClientContext.Provider value={{ isActive }}>
      {children}
    </DesktopClientContext.Provider>
  );
};

export default DesktopClientContext;
