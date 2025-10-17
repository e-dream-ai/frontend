import { useEffect, useRef, useState } from "react";
import { useVideoJs } from "@/hooks/useVideoJS";

interface VideoElementWithFrameCallback extends HTMLVideoElement {
  requestVideoFrameCallback(
    callback: (now: number, metadata: VideoFrameCallbackMetadata) => void,
  ): number;
  cancelVideoFrameCallback(id: number): void;
}

interface VideoFrameCallbackMetadata {
  presentationTime: number;
  expectedDisplayTime: number;
  width: number;
  height: number;
  mediaTime: number;
  presentedFrames: number;
  processingDuration?: number;
  captureTime?: number;
  receiveTime?: number;
  rtpTimestamp?: number;
}

export const useVideoFPS = () => {
  const { getActiveVideoElement, activePlayer, isReady } = useVideoJs();
  const [fps, setFps] = useState(0);

  const lastFrameTimeRef = useRef<number | null>(null);
  const framesRef = useRef(0);
  const windowStartRef = useRef(performance.now());
  const rafIdRef = useRef<number | null>(null);
  const rvfcIdRef = useRef<number | null>(null);

  const resetTracker = () => {
    framesRef.current = 0;
    lastFrameTimeRef.current = null;
    windowStartRef.current = performance.now();
    setFps(0);
  };

  const stopTracking = (video: VideoElementWithFrameCallback) => {
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (rvfcIdRef.current != null) {
      video.cancelVideoFrameCallback?.(rvfcIdRef.current);
      rvfcIdRef.current = null;
    }
  };

  useEffect(() => {
    if (!isReady || !activePlayer) {
      resetTracker();
      return;
    }

    const video =
      getActiveVideoElement() as VideoElementWithFrameCallback | null;
    if (!video) {
      resetTracker();
      return;
    }

    resetTracker();

    const updateFPS = (now: number, prev: number | null) => {
      if (prev == null) return now;
      framesRef.current++;
      const windowMs = now - windowStartRef.current;
      if (windowMs >= 500) {
        const current = (framesRef.current * 1000) / windowMs;
        setFps(Number.isFinite(current) ? Math.round(current) : 0);
        framesRef.current = 0;
        windowStartRef.current = now;
      }
      return now;
    };

    const startTracking = () => {
      stopTracking(video);
      resetTracker();

      if (video.requestVideoFrameCallback) {
        const loop = (now: number) => {
          lastFrameTimeRef.current = updateFPS(now, lastFrameTimeRef.current);
          rvfcIdRef.current = video.requestVideoFrameCallback(loop);
        };
        rvfcIdRef.current = video.requestVideoFrameCallback(loop);
      } else {
        const loop = (now: number) => {
          if (!video.paused && !video.ended) {
            lastFrameTimeRef.current = updateFPS(now, lastFrameTimeRef.current);
          }
          rafIdRef.current = requestAnimationFrame(loop);
        };
        rafIdRef.current = requestAnimationFrame(loop);
      }
    };

    const handlePlaying = () => startTracking();
    const handlePause = () => {
      stopTracking(video);
      resetTracker();
    };
    const handleEnded = () => {
      stopTracking(video);
      resetTracker();
    };

    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    if (!video.paused && video.readyState >= 2) {
      startTracking();
    }

    return () => {
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      stopTracking(video);
    };
  }, [getActiveVideoElement, activePlayer, isReady]);

  return { fps };
};
