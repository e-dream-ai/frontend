import { useEffect, useRef } from "react";

interface StatusCallbacks {
  onActive?: () => void;
  onInactive?: () => void;
}

interface StatusDelays {
  activeDelay?: number;
  inactiveDelay?: number;
}

// hook to observe the state of a var, onActive or onInactive event is triggered depending on the value of the variable
const useStatusCallback = (
  isActive: boolean,
  callbacks: StatusCallbacks,
  delays: StatusDelays = {},
  deps: unknown[] = [], // Add a deps array to control when effects shold be triggered
) => {
  const { onActive, onInactive } = callbacks;
  /**
   * delays default values
   */
  const { activeDelay = 5000, inactiveDelay = 5000 } = delays;

  // store callbacks references
  const onActiveRef = useRef(onActive);
  const onInactiveRef = useRef(onInactive);

  // update refs when callbacks change
  useEffect(() => {
    onActiveRef.current = onActive;
    onInactiveRef.current = onInactive;
  }, [
    onActive,
    onInactive,
    // Include deps in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...deps,
  ]);

  // store the timer IDs
  const timerRef = useRef<NodeJS.Timeout>();

  // Store the last active state to prevent unnecessary timer resets
  const lastActiveStateRef = useRef(isActive);

  useEffect(() => {
    // store previous state before updating
    const stateChanged = lastActiveStateRef.current !== isActive;
    lastActiveStateRef.current = isActive;

    // clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    // clear existing timer if state changed
    if (stateChanged && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    // set timer based on current state if there's no active timer
    if (!timerRef.current) {
      if (isActive && onActiveRef.current) {
        timerRef.current = setTimeout(() => {
          onActiveRef.current?.();
        }, activeDelay);
      } else if (!isActive && onInactiveRef.current) {
        timerRef.current = setTimeout(() => {
          onInactiveRef.current?.();
        }, inactiveDelay);
      }
    }

    // cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isActive,
    activeDelay,
    inactiveDelay,
    // Include deps in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...deps,
  ]); // Include deps in the dependency array
};

export default useStatusCallback;
