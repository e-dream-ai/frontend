import { useCallback, useMemo, useState } from "react";
import type { CrossfadeSegment } from "../components/crossfade-video";

export const useMatrixPreview = (segments: readonly CrossfadeSegment[]) => {
  const [currentUuid, setCurrentUuid] = useState<string | null>(null);
  const [replayToken, setReplayToken] = useState(0);

  const foundIndex = segments.findIndex((s) => s.key === currentUuid);
  const previewIndex = foundIndex >= 0 ? foundIndex : 0;
  const playingUuid = segments[previewIndex]?.key ?? null;

  const segmentKeys = useMemo(
    () => new Set(segments.map((s) => s.key)),
    [segments],
  );

  const playSegment = useCallback((dreamUuid: string) => {
    setCurrentUuid(dreamUuid);
    setReplayToken((n) => n + 1);
  }, []);

  const showIndex = useCallback(
    (next: number) => setCurrentUuid(segments[next]?.key ?? null),
    [segments],
  );

  return {
    previewIndex,
    playingUuid,
    segmentKeys,
    replayToken,
    playSegment,
    showIndex,
  };
};
