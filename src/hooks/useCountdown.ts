import { useCallback, useEffect, useRef, useState } from "react";

export const useCountdown = () => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  const clear = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = undefined;
  }, []);

  const start = useCallback(
    (seconds: number) => {
      clear();
      const initial = Math.max(0, Math.ceil(seconds));
      setSecondsLeft(initial);
      if (initial <= 0) return;

      intervalRef.current = setInterval(() => {
        setSecondsLeft((current) => (current <= 1 ? 0 : current - 1));
      }, 1000);
    },
    [clear],
  );

  useEffect(() => {
    if (secondsLeft === 0) clear();
  }, [secondsLeft, clear]);

  useEffect(() => clear, [clear]);

  return { secondsLeft, isActive: secondsLeft > 0, start, reset: clear };
};

export default useCountdown;
