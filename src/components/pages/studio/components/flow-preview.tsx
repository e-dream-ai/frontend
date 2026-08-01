import { useRef, useState, useCallback, useEffect, useMemo } from "react";
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
  VideoLayer,
  ClickHint,
  LightboxOverlay,
  LightboxVideo,
  NavButton,
  SegmentCounter,
  ChipRail,
  SegmentChip,
} from "./flow-preview.styled";
import {
  initialPreviewBuffer,
  backLayer,
  requestIndex,
  ready,
  type Layer,
} from "../utils/preview-buffer";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

const LAYERS: Layer[] = [0, 1];

export function FlowPreview() {
  const { transitions, previewLightboxOpen, setPreviewLightboxOpen } =
    useFlowStore(
      useShallow((s) => ({
        transitions: s.transitions,
        previewLightboxOpen: s.previewLightboxOpen,
        setPreviewLightboxOpen: s.setPreviewLightboxOpen,
      })),
    );

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

  const completedSegments = useMemo(
    () =>
      dreamQueries
        .map((q, i) => {
          const url = q.data?.video;
          if (!url) return null;
          return {
            dreamUuid: completedUuids[i],
            url,
            // Poster is shown while the <video> loads — a still frame beats black
            // if a segment is slow to buffer (issue #670 fallback).
            poster: q.data?.thumbnail,
          };
        })
        .filter(
          (
            s,
          ): s is {
            dreamUuid: string;
            url: string;
            poster: string | undefined;
          } => s !== null,
        ),
    [dreamQueries, completedUuids],
  );

  // targetIndex drives the chips/counter so they respond to a click immediately,
  // even while the next segment is still buffering behind the visible frame.
  const [rawTarget, setTargetIndex] = useState(0);
  // buf owns which of the two <video> layers is visible and when they swap.
  const [buf, setBuf] = useState(() => initialPreviewBuffer(0));

  const videoRef0 = useRef<HTMLVideoElement>(null);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRefs = useMemo(() => [videoRef0, videoRef1] as const, []);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const segmentCount = completedSegments.length;
  // Clamp during render so segment churn never points at a dead index.
  const targetIndex = rawTarget >= segmentCount ? 0 : rawTarget;

  // Latest values for event handlers that must not close over stale renders.
  const targetRef = useRef(targetIndex);
  targetRef.current = targetIndex;
  const bufRef = useRef(buf);
  bufRef.current = buf;
  const segCountRef = useRef(segmentCount);
  segCountRef.current = segmentCount;

  const goTo = useCallback((next: number) => {
    const count = segCountRef.current;
    if (count === 0) return;
    const wrapped = ((next % count) + count) % count;
    setTargetIndex(wrapped);
    setBuf((s) => requestIndex(s, wrapped));
  }, []);

  // If segments shrink underneath us, snap the buffer back to a valid index.
  useEffect(() => {
    if (segmentCount > 0 && rawTarget >= segmentCount) {
      setTargetIndex(0);
      setBuf((s) => requestIndex(s, 0));
    }
  }, [segmentCount, rawTarget]);

  // Keep the visible layer playing; pause the hidden one so only the on-screen
  // segment advances (and so a background clip can't fire onEnded and steal nav).
  useEffect(() => {
    videoRefs[buf.front].current?.play().catch(() => undefined);
    videoRefs[backLayer(buf.front)].current?.pause();
  }, [buf.front, videoRefs]);

  // Escape closes the lightbox; ←/→ navigate when the preview is focused.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (previewLightboxOpen && e.key === "Escape") {
        setPreviewLightboxOpen(false);
        return;
      }
      if (segCountRef.current < 2) return;
      const active = document.activeElement;
      const inWrapper = active && wrapperRef.current?.contains(active as Node);
      if (!inWrapper && !previewLightboxOpen) return;
      if (e.key === "ArrowRight") goTo(targetRef.current + 1);
      else if (e.key === "ArrowLeft") goTo(targetRef.current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewLightboxOpen, goTo, setPreviewLightboxOpen]);

  if (segmentCount === 0) return null;

  const showNav = segmentCount > 1;
  const currentUrl = completedSegments[targetIndex]?.url;
  const currentPoster = completedSegments[targetIndex]?.poster;

  return (
    <>
      <PreviewContainer>
        <PreviewLabel>Preview</PreviewLabel>

        <VideoWrapper
          ref={wrapperRef}
          tabIndex={0}
          onClick={() => setPreviewLightboxOpen(true)}
        >
          {LAYERS.map((layer) => {
            const segIndex = buf.loaded[layer];
            const segment =
              segIndex == null ? undefined : completedSegments[segIndex];
            return (
              <VideoLayer
                key={layer}
                ref={videoRefs[layer]}
                $visible={buf.front === layer}
                src={segment?.url}
                poster={segment?.poster}
                autoPlay
                muted
                playsInline
                // Only loop when there's a single segment; otherwise advance on end.
                loop={segmentCount === 1}
                onLoadedData={() =>
                  setBuf((s) => {
                    const idx = s.loaded[layer];
                    return idx == null ? s : ready(s, layer, idx);
                  })
                }
                onEnded={() => {
                  // Only the on-screen segment advances the carousel.
                  if (bufRef.current.front !== layer) return;
                  if (segCountRef.current > 1) {
                    const shown =
                      bufRef.current.loaded[layer] ?? targetRef.current;
                    goTo(shown + 1);
                  }
                }}
              />
            );
          })}

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
            {completedSegments.map((_, i) => (
              <SegmentChip
                key={i}
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

      {previewLightboxOpen &&
        createPortal(
          <LightboxOverlay
            onClick={() => setPreviewLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Video preview"
          >
            <LightboxVideo onClick={(e) => e.stopPropagation()}>
              <video
                key={currentUrl}
                src={currentUrl}
                poster={currentPoster}
                autoPlay
                controls
              />
            </LightboxVideo>
          </LightboxOverlay>,
          document.body,
        )}
    </>
  );
}
