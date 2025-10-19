import { createContext, useEffect, useMemo, useState } from "react";
import {
  GOOD_BYE_EVENT,
  PING_EVENT,
} from "@/constants/remote-control.constants";
import useAuth from "@/hooks/useAuth";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import { NEW_REMOTE_CONTROL_EVENT } from "@/constants/remote-control.constants";
import { REMOTE_CONTROLS } from "@/constants/remote-control.constants";
import { RemoteControlEventData } from "@/types/remote-control.types";

// Create context
type DesktopClientContextType = {
  isActive: boolean;
  currentTime: number;
  duration: number;
  fps: number;
  speedLevel: number;
  setSpeedLevel: (speed: number) => void;
  isCreditOverlayVisible: boolean;
  toggleCreditOverlay: () => void;
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
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [fps, setFps] = useState<number>(0);
  const [speedLevel, setSpeedLevel] = useState<number>(9);
  const [isCreditOverlayVisible, setIsCreditOverlayVisible] =
    useState<boolean>(false);

  const toggleCreditOverlay = (): void => {
    setIsCreditOverlayVisible((prev) => !prev);
  };

  /**
   * Handle ping event, set to active status when it arrives
   */
  const handlePingEvent = async (): Promise<void> => {
    setIsActive(true);
    console.log("handlePingEvent", user?.email, isActive);
    const now = Date.now();
    setLastEventTime(now);
  };

  /**
   * Handle goodbye event, set to inactive status when it arrives
   */
  const handleGoodbyeEvent = async (): Promise<void> => {
    setIsActive(false);
    console.log("handleGoodbyeEvent", user?.email, isActive);
    setLastEventTime(undefined);
    setCurrentTime(0);
    setDuration(0);
    setFps(0);
    setSpeedLevel(9);
    setIsCreditOverlayVisible(false);
  };

  /**
   * Handle new remote control events from the server for dream on profile
   */
  useSocketEventListener(PING_EVENT, handlePingEvent);
  useSocketEventListener(GOOD_BYE_EVENT, handleGoodbyeEvent);

  /**
   * Handle status updates from desktop client containing playback metrics
   */
  useSocketEventListener<RemoteControlEventData>(
    NEW_REMOTE_CONTROL_EVENT,
    async (data?: RemoteControlEventData) => {
      if (!data?.event) return;
      setIsActive(true);
      setLastEventTime(Date.now());

      // Update metrics on status payload
      if (data.event === REMOTE_CONTROLS.STATUS.event) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload = data as unknown as Record<string, any>;
        const nextTime = Number(payload.currentTime);
        const nextDuration = Number(payload.duration);
        const nextFps = Number(payload.fps);
        if (Number.isFinite(nextTime)) setCurrentTime(Math.max(0, nextTime));
        if (Number.isFinite(nextDuration))
          setDuration(Math.max(0, nextDuration));
        if (Number.isFinite(nextFps)) setFps(Math.max(0, Math.round(nextFps)));
        if (payload?.paused === true) {
          setSpeedLevel(0);
          setFps(0);
        }
      }

      // Track speed changes from remote control events 1..9 and pause
      const speedMap: Record<string, number> = {
        [REMOTE_CONTROLS.SET_SPEED_1.event]: 1,
        [REMOTE_CONTROLS.SET_SPEED_2.event]: 2,
        [REMOTE_CONTROLS.SET_SPEED_3.event]: 3,
        [REMOTE_CONTROLS.SET_SPEED_4.event]: 4,
        [REMOTE_CONTROLS.SET_SPEED_5.event]: 5,
        [REMOTE_CONTROLS.SET_SPEED_6.event]: 6,
        [REMOTE_CONTROLS.SET_SPEED_7.event]: 7,
        [REMOTE_CONTROLS.SET_SPEED_8.event]: 8,
        [REMOTE_CONTROLS.SET_SPEED_9.event]: 9,
        [REMOTE_CONTROLS.PAUSE_1.event]: 0,
        [REMOTE_CONTROLS.PAUSE_2.event]: 0,
      } as const;

      if (data.event in speedMap) {
        const newSpeed = speedMap[data.event];
        setSpeedLevel(newSpeed);
        if (newSpeed === 0) {
          setFps(0);
        }
      }

      // Toggle credit overlay visibility when CREDIT event is received
      if (data.event === REMOTE_CONTROLS.CREDIT.event) {
        setIsCreditOverlayVisible((prev) => !prev);
      }
    },
  );

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
    <DesktopClientContext.Provider
      value={useMemo(
        () => ({
          isActive,
          currentTime,
          duration,
          fps,
          speedLevel,
          setSpeedLevel,
          isCreditOverlayVisible,
          toggleCreditOverlay,
        }),
        [
          isActive,
          currentTime,
          duration,
          fps,
          speedLevel,
          isCreditOverlayVisible,
          toggleCreditOverlay,
        ],
      )}
    >
      {children}
    </DesktopClientContext.Provider>
  );
};

export default DesktopClientContext;
