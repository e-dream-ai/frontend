import { createContext, useEffect, useMemo, useRef, useState } from "react";
import {
  GOOD_BYE_EVENT,
  PING_EVENT,
  STATE_SYNC_EVENT,
} from "@/constants/remote-control.constants";
import useAuth from "@/hooks/useAuth";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import useSocket from "@/hooks/useSocket";
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
  const { socket, isConnected } = useSocket();
  const [lastEventTime, setLastEventTime] = useState<number | undefined>();
  const [isActive, setIsActive] = useState<boolean>(false);
  const hasRequestedStateRef = useRef<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [fps, setFps] = useState<number>(0);
  const [speedLevel, setSpeedLevel] = useState<number>(9);
  const [isCreditOverlayVisible, setIsCreditOverlayVisible] =
    useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [stateSyncReceived, setStateSyncReceived] = useState<number>(0); // Trigger to restart interpolation
  const lastServerTimeRef = useRef<number>(0);
  const lastServerTimestampRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);

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
    isPausedRef.current = false;
    setIsPaused(false);
  };

  /**
   * Handle new remote control events from the server for dream on profile
   */
  useSocketEventListener(PING_EVENT, handlePingEvent);
  useSocketEventListener(GOOD_BYE_EVENT, handleGoodbyeEvent);

  useSocketEventListener<{
    dream_uuid?: string;
    playlist?: string;
    timecode?: string;
    hud?: string;
    paused?: string;
    playback_speed?: string;
    fps?: string;
  }>(STATE_SYNC_EVENT, async (data) => {
    if (!data) return;

    setIsActive(true);
    const now = Date.now();
    setLastEventTime(now);

    const nextTime = data.timecode ? Number(data.timecode) : undefined;
    const nextFps = data.playback_speed
      ? Number(data.playback_speed)
      : data.fps
        ? Number(data.fps)
        : undefined;
    const isPaused = data.paused === "true";

    // Store server values for interpolation
    if (nextTime !== undefined && Number.isFinite(nextTime)) {
      lastServerTimeRef.current = Math.max(0, nextTime);
      lastServerTimestampRef.current = now;
      setCurrentTime(lastServerTimeRef.current);
      setStateSyncReceived(now);
    }
    if (nextFps !== undefined && Number.isFinite(nextFps)) {
      setFps(Math.max(0, Math.round(nextFps)));
    }
    isPausedRef.current = isPaused;
    setIsPaused(isPaused);
    if (isPaused) {
      setSpeedLevel(0);
      setFps(0);
    }
  });

  /**
   * Handle status updates from desktop client containing playback metrics
   */
  useSocketEventListener<RemoteControlEventData>(
    NEW_REMOTE_CONTROL_EVENT,
    async (data?: RemoteControlEventData) => {
      if (!data?.event) return;

      if (
        data.isWebClientEvent !== true &&
        data.event === REMOTE_CONTROLS.STATUS.event
      ) {
        setIsActive(true);
        setLastEventTime(Date.now());
      }

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
          isPausedRef.current = true;
          setIsPaused(true);
        } else if (payload?.paused === false) {
          isPausedRef.current = false;
          setIsPaused(false);
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
          isPausedRef.current = true;
          setIsPaused(true);
        } else {
          isPausedRef.current = false;
          setIsPaused(false);
        }
      }

      // Toggle credit overlay visibility when CREDIT event is received
      if (data.event === REMOTE_CONTROLS.CREDIT.event) {
        setIsCreditOverlayVisible((prev) => !prev);
      }
    },
  );

  useEffect(() => {
    if (!socket || hasRequestedStateRef.current) {
      return;
    }

    const handleConnect = () => {
      hasRequestedStateRef.current = true;
    };

    socket.on("connect", handleConnect);

    if (isConnected) {
      setTimeout(() => {
        hasRequestedStateRef.current = true;
      }, 200);
    }

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [socket, isConnected]);

  useEffect(() => {
    // Only start interpolation if we have valid server state
    if (!isActive || isPaused || !lastServerTimestampRef.current) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = (now - lastServerTimestampRef.current) / 1000;
      if (timeSinceLastUpdate < 0) {
        return;
      }
      const interpolatedTime = lastServerTimeRef.current + timeSinceLastUpdate;

      setCurrentTime(Math.max(0, interpolatedTime));
      lastServerTimeRef.current = interpolatedTime;
      lastServerTimestampRef.current = now;
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isActive, isPaused, stateSyncReceived]);

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
