import { useMemo } from "react";
import { useWebClient } from "@/hooks/useWebClient";
import { useVideoJs } from "@/hooks/useVideoJS";
import { useVideoFPS } from "@/hooks/useVideoFPS";
import { useDesktopClient } from "@/hooks/useDesktopClient";

export type PlaybackMetrics = {
  currentTime: number;
  duration: number;
  fps: number;
  source: "web" | "desktop";
};

export const usePlaybackMetrics = (): PlaybackMetrics => {
  useWebClient();
  const { currentTime: webCurrentTime = 0, duration: webDuration = 0 } =
    useVideoJs();
  const { fps: webFps = 0 } = useVideoFPS();
  const {
    isActive: isDesktopActive,
    currentTime,
    duration,
    fps,
  } = useDesktopClient();

  return useMemo(() => {
    const desktopMetrics: PlaybackMetrics = {
      currentTime: Number.isFinite(currentTime) ? currentTime : 0,
      duration: Number.isFinite(duration) ? duration : 0,
      fps: Number.isFinite(fps) ? fps : 0,
      source: "desktop",
    };

    const webMetrics: PlaybackMetrics = {
      currentTime: Number.isFinite(webCurrentTime) ? webCurrentTime : 0,
      duration: Number.isFinite(webDuration) ? webDuration : 0,
      fps: Number.isFinite(webFps) ? webFps : 0,
      source: "web",
    };

    if (isDesktopActive) {
      const hasDesktopData =
        desktopMetrics.fps > 0 ||
        desktopMetrics.duration > 0 ||
        desktopMetrics.currentTime > 0;
      return hasDesktopData ? desktopMetrics : webMetrics;
    }

    // Otherwise use web
    return webMetrics;
  }, [
    isDesktopActive,
    currentTime,
    duration,
    fps,
    webCurrentTime,
    webDuration,
    webFps,
  ]);
};

export default usePlaybackMetrics;
