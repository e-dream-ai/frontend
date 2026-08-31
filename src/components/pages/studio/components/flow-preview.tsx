import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQueries, type QueryFunctionContext } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import { DREAM_QUERY_KEY, getDream } from "@/api/dream/query/useDream";
import type { Dream } from "@/types/dream.types";
import {
  PreviewContainer,
  PreviewLabel,
  VideoWrapper,
  ClickHint,
  LightboxOverlay,
  LightboxVideo,
  NavButton,
  SegmentCounter,
  ChipRail,
  SegmentChip,
} from "./flow-preview.styled";
import { CrossfadeVideo, type CrossfadeSegment } from "./crossfade-video";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import { mediaAspectRatio } from "../utils/media-aspect-ratio";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

interface PreviewLightboxProps {
  segments: readonly CrossfadeSegment[];
  index: number;
  loop: boolean;
  ratio?: string;
  onMeasured: (key: string, ratio: string) => void;
  onClose: () => void;
  onEnded: () => void;
  replayToken?: number;
}

function PreviewLightbox({
  segments,
  index,
  loop,
  ratio,
  onMeasured,
  onClose,
  onEnded,
  replayToken,
}: PreviewLightboxProps) {
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);

  return createPortal(
    <LightboxOverlay
      ref={overlayRef}
      tabIndex={-1}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Video preview"
    >
      <LightboxVideo $ratio={ratio} onClick={(e) => e.stopPropagation()}>
        <CrossfadeVideo
          segments={segments}
          index={index}
          controls
          loop={loop}
          onMeasured={onMeasured}
          onEnded={onEnded}
          replayToken={replayToken}
        />
      </LightboxVideo>
    </LightboxOverlay>,
    document.body,
  );
}

export function FlowPreview() {
  const {
    transitions,
    previewLightboxOpen,
    setPreviewLightboxOpen,
    frameLightboxOpen,
  } = useFlowStore(
    useShallow((s) => ({
      transitions: s.transitions,
      previewLightboxOpen: s.previewLightboxOpen,
      setPreviewLightboxOpen: s.setPreviewLightboxOpen,
      frameLightboxOpen: s.frameLightboxId !== null,
    })),
  );

  // The dream of the last-clicked transition. Selecting a transition should
  // play it, so the preview follows this rather than only advancing on its own.
  const primaryDreamUuid = useFlowStore((s) => {
    const selected = s.selectedTransitionIndices;
    if (selected.length === 0) return undefined;
    return s.transitions[selected[selected.length - 1]]?.dreamUuid;
  });
  const playRequest = useFlowStore((s) => s.previewPlayRequest);

  const completedUuids = useMemo(
    () =>
      transitions
        .filter((t) => t.status === "processed" && t.dreamUuid)
        .map((t) => t.dreamUuid as string),
    [transitions],
  );

  const dreamQueries = useQueries({
    queries: completedUuids.map((uuid) => ({
      queryKey: [DREAM_QUERY_KEY, uuid],
      queryFn: ({ signal }: QueryFunctionContext) => getDream(uuid, signal),
      staleTime: Infinity,
      refetchInterval: (data: unknown) =>
        (data as Dream | undefined)?.video ? false : 3000,
      refetchIntervalInBackground: false,
    })),
  });

  // Not memoized: `useQueries` returns a fresh array every render, so a useMemo
  // keyed on it would never hit.
  const segments: CrossfadeSegment[] = dreamQueries.flatMap((q, i) => {
    // Prefer the original over the processed file. Processing normalises every
    // video to 1920x1080, so the processed copy of a square render is 16:9 and
    // would show the flow in the wrong shape. The original keeps the shape the
    // model produced, and is what processedMediaWidth/Height measures.
    const url = q.data?.original_video || q.data?.video;
    if (!url) return [];
    return [
      {
        key: completedUuids[i],
        url,
        poster: q.data?.thumbnail,
        ratio: mediaAspectRatio(
          q.data?.processedMediaWidth,
          q.data?.processedMediaHeight,
        ),
      },
    ];
  });

  // A file's header is the last word on its shape; the recorded dimensions are
  // only a hint used until it arrives.
  const [measuredRatios, setMeasuredRatios] = useState<Record<string, string>>(
    {},
  );
  const handleMeasured = useCallback((key: string, ratio: string) => {
    setMeasuredRatios((prev) =>
      prev[key] === ratio ? prev : { ...prev, [key]: ratio },
    );
  }, []);

  const [rawTarget, setTargetIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const segmentCount = segments.length;
  // Clamped during render so segment churn never points at a dead index.
  const targetIndex = rawTarget >= segmentCount ? 0 : rawTarget;

  const goTo = useCallback(
    (next: number) => {
      if (segmentCount === 0) return;
      setTargetIndex(((next % segmentCount) + segmentCount) % segmentCount);
    },
    [segmentCount],
  );

  const advance = useCallback(() => {
    if (segmentCount > 1) goTo(targetIndex + 1);
  }, [goTo, targetIndex, segmentCount]);

  // Depend on the joined keys, not the array: `segments` is rebuilt every
  // render, so an array dep would re-run this effect forever.
  const segmentKeys = segments.map((segment) => segment.key).join(",");

  useEffect(() => {
    if (!primaryDreamUuid) return;
    const next = segmentKeys.split(",").indexOf(primaryDreamUuid);
    // A selected transition that hasn't rendered yet has no segment to show —
    // leave whatever is playing alone rather than jumping to an unrelated clip.
    if (next >= 0) setTargetIndex(next);
  }, [primaryDreamUuid, segmentKeys]);

  // An explicit play request seeks to the segment and, via replayToken,
  // restarts it even when it is already the one on screen.
  const [replayToken, setReplayToken] = useState(0);
  useEffect(() => {
    if (!playRequest) return;
    const next = segmentKeys.split(",").indexOf(playRequest.dreamUuid);
    if (next < 0) return;
    setTargetIndex(next);
    setReplayToken(playRequest.seq);
  }, [playRequest, segmentKeys]);

  useEffect(() => {
    if (segmentCount < 2) return;
    if (frameLightboxOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const active = document.activeElement;
      const inWrapper = active && wrapperRef.current?.contains(active as Node);
      if (!inWrapper && !previewLightboxOpen) return;
      e.preventDefault();
      goTo(targetIndex + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [segmentCount, frameLightboxOpen, previewLightboxOpen, targetIndex, goTo]);

  if (segmentCount === 0) return null;

  const showNav = segmentCount > 1;
  const targetSegment = segments[targetIndex];
  const targetRatio = measuredRatios[targetSegment.key] ?? targetSegment.ratio;

  return (
    <>
      <PreviewContainer>
        <PreviewLabel>Preview</PreviewLabel>

        <VideoWrapper
          ref={wrapperRef}
          tabIndex={0}
          $ratio={targetRatio}
          onClick={() => setPreviewLightboxOpen(true)}
        >
          <CrossfadeVideo
            segments={segments}
            index={targetIndex}
            onMeasured={handleMeasured}
            active={!previewLightboxOpen}
            muted
            loop={segmentCount === 1}
            onEnded={advance}
            replayToken={replayToken}
          />

          {showNav && (
            <>
              <NavButton
                $side="left"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(targetIndex - 1);
                }}
                aria-label="Previous segment"
              >
                <ChevronLeft size={16} strokeWidth={2.4} />
              </NavButton>
              <NavButton
                $side="right"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(targetIndex + 1);
                }}
                aria-label="Next segment"
              >
                <ChevronRight size={16} strokeWidth={2.4} />
              </NavButton>
              <SegmentCounter>
                {pad(targetIndex + 1)} / {pad(segmentCount)}
              </SegmentCounter>
            </>
          )}
        </VideoWrapper>

        {showNav && (
          <ChipRail role="tablist" aria-label="Segments">
            {segments.map((segment, i) => (
              <SegmentChip
                key={segment.key}
                $active={i === targetIndex}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === targetIndex}
                aria-label={`Segment ${i + 1}`}
              >
                {pad(i + 1)}
              </SegmentChip>
            ))}
          </ChipRail>
        )}

        <ClickHint>Click to expand</ClickHint>
      </PreviewContainer>

      {previewLightboxOpen && (
        <PreviewLightbox
          segments={segments}
          index={targetIndex}
          loop={segmentCount === 1}
          ratio={targetRatio}
          onMeasured={handleMeasured}
          onClose={() => setPreviewLightboxOpen(false)}
          onEnded={advance}
          replayToken={replayToken}
        />
      )}
    </>
  );
}
