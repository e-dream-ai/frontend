import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQueries } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import { DREAM_QUERY_KEY } from "@/api/dream/query/useDream";
import type { Dream } from "@/types/dream.types";
import type { ApiResponse } from "@/types/api.types";
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

async function fetchDream(uuid: string): Promise<Dream | undefined> {
  const res = await axiosClient.get<ApiResponse<{ dream: Dream }>>(
    `/v1/dream/${uuid}`,
    { headers: getRequestHeaders({ contentType: ContentType.json }) },
  );
  return res.data?.data?.dream;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function FlowPreview() {
  const transitions = useFlowStore(useShallow((s) => s.transitions));

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
      queryFn: () => fetchDream(uuid),
      staleTime: Infinity,
    })),
  });

  const completedSegments = useMemo(
    () =>
      dreamQueries
        .map((q, i) => {
          const url = q.data?.video;
          if (!url) return null;
          return { dreamUuid: completedUuids[i], url };
        })
        .filter((s): s is { dreamUuid: string; url: string } => s !== null),
    [dreamQueries, completedUuids],
  );

  const [rawIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Clamp during render so segment churn never points at a dead index.
  const segmentCount = completedSegments.length;
  const currentIndex = rawIndex >= segmentCount ? 0 : rawIndex;

  const goTo = useCallback(
    (next: number) => {
      if (segmentCount === 0) return;
      const wrapped = ((next % segmentCount) + segmentCount) % segmentCount;
      setCurrentIndex(wrapped);
    },
    [segmentCount],
  );

  const handleEnded = useCallback(() => {
    // Single segment: just loop. Multi: advance to next.
    if (segmentCount > 1) goTo(currentIndex + 1);
    else videoRef.current?.play().catch(() => undefined);
  }, [currentIndex, segmentCount, goTo]);

  // Escape closes the lightbox; ←/→ navigate when the preview is focused.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxOpen && e.key === "Escape") {
        setLightboxOpen(false);
        return;
      }
      if (segmentCount < 2) return;
      const active = document.activeElement;
      const inWrapper = active && wrapperRef.current?.contains(active as Node);
      if (!inWrapper && !lightboxOpen) return;
      if (e.key === "ArrowRight") goTo(currentIndex + 1);
      else if (e.key === "ArrowLeft") goTo(currentIndex - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, segmentCount, currentIndex, goTo]);

  if (segmentCount === 0) return null;

  const currentUrl = completedSegments[currentIndex]?.url;
  const showNav = segmentCount > 1;

  return (
    <>
      <PreviewContainer>
        <PreviewLabel>Preview</PreviewLabel>

        <VideoWrapper
          ref={wrapperRef}
          tabIndex={0}
          onClick={() => setLightboxOpen(true)}
        >
          <video
            key={currentUrl}
            ref={videoRef}
            src={currentUrl}
            autoPlay
            muted
            // Only loop when there's a single segment; otherwise advance to next on end.
            loop={segmentCount === 1}
            onEnded={handleEnded}
          />

          {showNav && (
            <>
              <NavButton
                $side="left"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(currentIndex - 1);
                }}
                aria-label="Previous segment"
              >
                <ChevronLeft size={16} strokeWidth={2.4} />
              </NavButton>
              <NavButton
                $side="right"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(currentIndex + 1);
                }}
                aria-label="Next segment"
              >
                <ChevronRight size={16} strokeWidth={2.4} />
              </NavButton>
              <SegmentCounter>
                {pad(currentIndex + 1)} / {pad(segmentCount)}
              </SegmentCounter>
            </>
          )}
        </VideoWrapper>

        {showNav && (
          <ChipRail role="tablist" aria-label="Segments">
            {completedSegments.map((_, i) => (
              <SegmentChip
                key={i}
                $active={i === currentIndex}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`Segment ${i + 1}`}
              >
                {pad(i + 1)}
              </SegmentChip>
            ))}
          </ChipRail>
        )}

        <ClickHint>Click to expand</ClickHint>
      </PreviewContainer>

      {lightboxOpen &&
        createPortal(
          <LightboxOverlay
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Video preview"
          >
            <LightboxVideo onClick={(e) => e.stopPropagation()}>
              <video key={currentUrl} src={currentUrl} autoPlay controls />
            </LightboxVideo>
          </LightboxOverlay>,
          document.body,
        )}
    </>
  );
}
