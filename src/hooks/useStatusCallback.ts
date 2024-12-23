import { useEffect, useRef } from "react";

interface StatusCallbacks {
  onActive?: () => void;
  onInactive?: () => void;
}

interface StatusDelays {
  activeDelay?: number;
  inactiveDelay?: number;
}

const useStatusCallback = (
  isActive: boolean,
  callbacks: StatusCallbacks,
  delays: StatusDelays = {},
) => {
  const { onActive, onInactive } = callbacks;
  /**
   * delays default values
   */
  const { activeDelay = 5000, inactiveDelay = 5000 } = delays;

  const activeTimerRef = useRef<NodeJS.Timeout>();
  const inactiveTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // clear any existing timers
    if (activeTimerRef.current) {
      clearTimeout(activeTimerRef.current);
    }
    if (inactiveTimerRef.current) {
      clearTimeout(inactiveTimerRef.current);
    }

    if (isActive && onActive) {
      activeTimerRef.current = setTimeout(() => {
        onActive();
      }, activeDelay);
    } else if (!isActive && onInactive) {
      inactiveTimerRef.current = setTimeout(() => {
        onInactive();
      }, inactiveDelay);
    }

    // cleanup on unmount or when isActive changes
    return () => {
      if (activeTimerRef.current) {
        clearTimeout(activeTimerRef.current);
      }
      if (inactiveTimerRef.current) {
        clearTimeout(inactiveTimerRef.current);
      }
    };
  }, [isActive, onActive, onInactive, activeDelay, inactiveDelay]);
};

export default useStatusCallback;
