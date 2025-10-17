import { createContext, useEffect, useMemo, useRef, useState } from "react";
import {
  GOOD_BYE_EVENT,
  PING_EVENT,
} from "@/constants/remote-control.constants";
import useAuth from "@/hooks/useAuth";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import { NEW_REMOTE_CONTROL_EVENT } from "@/constants/remote-control.constants";
import { REMOTE_CONTROLS } from "@/constants/remote-control.constants";
import { RemoteControlEventData } from "@/types/remote-control.types";
import { framesToSeconds } from "@/utils/video.utils";
import { calculatePlaybackRateFromSpeed } from "@/utils/web-client.util";

// Create context
type DesktopClientContextType = {
  isActive: boolean;
  currentTime: number;
  duration: number;
  fps: number;
  speedLevel: number;
  setSpeedLevel: (speed: number) => void;
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
  const { user, currentDream } = useAuth();
  const [lastEventTime, setLastEventTime] = useState<number | undefined>();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [fps, setFps] = useState<number>(0);
  const [speedLevel, setSpeedLevel] = useState<number>(9);
  const lastTickRef = useRef<number>(0);

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
      // Mark activity for any event from desktop
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
        setSpeedLevel(speedMap[data.event]);
      }

      // Handle seek and navigation adjustments
      if (data.event === REMOTE_CONTROLS.FORWARD.event) {
        setCurrentTime((prev) =>
          Math.min(prev + 10, duration || Number.MAX_SAFE_INTEGER),
        );
      }
      if (data.event === REMOTE_CONTROLS.BACKWARD.event) {
        setCurrentTime((prev) => Math.max(prev - 10, 0));
      }
      if (
        data.event === REMOTE_CONTROLS.GO_NEXT_DREAM.event ||
        data.event === REMOTE_CONTROLS.GO_PREVIOUS_DREAM.event ||
        data.event === REMOTE_CONTROLS.PLAYING.event
      ) {
        setCurrentTime(0);
      }
    },
  );

  useEffect(() => {
    const fallbackDuration = framesToSeconds(
      currentDream?.processedVideoFrames ?? 0,
      currentDream?.activityLevel ?? 0,
    );
    if (!duration && fallbackDuration > 0) {
      setDuration(fallbackDuration);
    }
    const originalFps = currentDream?.processedVideoFPS ?? 0;
    if (!fps && originalFps > 0) {
      setFps(Math.round(originalFps));
    }
  }, [currentDream, duration, fps]);

  // Fallback: tick currentTime locally when desktop is active and playing
  useEffect(() => {
    let rafId: number | null = null;
    const loop = (now: number) => {
      if (lastTickRef.current === 0) {
        lastTickRef.current = now;
      }
      const deltaMs = now - lastTickRef.current;
      lastTickRef.current = now;
      if (isActive && speedLevel > 0) {
        const rate = calculatePlaybackRateFromSpeed(
          speedLevel,
          currentDream?.activityLevel,
        );
        const deltaSec = (deltaMs / 1000) * (Number.isFinite(rate) ? rate : 1);
        setCurrentTime((prev) => {
          const next = prev + deltaSec;
          return duration ? Math.min(next, duration) : next;
        });
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      lastTickRef.current = 0;
    };
  }, [isActive, speedLevel, currentDream?.activityLevel, duration]);

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
        }),
        [isActive, currentTime, duration, fps, speedLevel],
      )}
    >
      {children}
    </DesktopClientContext.Provider>
  );
};

export default DesktopClientContext;
