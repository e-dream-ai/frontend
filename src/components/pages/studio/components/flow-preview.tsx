import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFlowStore } from "@/stores/flow.store";
import { useShallow } from "zustand/react/shallow";
import {
  PreviewContainer,
  PreviewLabel,
  VideoWrapper,
  ClickHint,
  LightboxOverlay,
  LightboxVideo,
  SegmentIndicator,
  SegmentDot,
} from "./flow-preview.styled";

// TODO: Replace with actual video URL resolution.
// For now, this constructs a URL from dream UUID.
function getDreamVideoUrl(dreamUuid: string): string {
  return `/v1/dream/${dreamUuid}/video`;
}

export function FlowPreview() {
  const transitions = useFlowStore(useShallow((s) => s.transitions));

  const completedSegments = transitions
    .filter((t) => t.status === "processed" && t.dreamUuid)
    .map((t) => ({
      dreamUuid: t.dreamUuid!,
      url: getDreamVideoUrl(t.dreamUuid!),
    }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset index when segments change
  useEffect(() => {
    if (currentIndex >= completedSegments.length) {
      setCurrentIndex(0);
    }
  }, [completedSegments.length, currentIndex]);

  const handleEnded = useCallback(() => {
    if (currentIndex < completedSegments.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back
    }
  }, [currentIndex, completedSegments.length]);

  if (completedSegments.length === 0) return null;

  const currentUrl = completedSegments[currentIndex]?.url;

  return (
    <>
      <PreviewContainer>
        <PreviewLabel>Preview</PreviewLabel>
        <VideoWrapper onClick={() => setLightboxOpen(true)}>
          <video
            ref={videoRef}
            src={currentUrl}
            autoPlay
            muted
            onEnded={handleEnded}
          />
        </VideoWrapper>
        <SegmentIndicator>
          {completedSegments.map((_, i) => (
            <SegmentDot key={i} $active={i === currentIndex} />
          ))}
        </SegmentIndicator>
        <ClickHint>Click to expand</ClickHint>
      </PreviewContainer>

      {lightboxOpen &&
        createPortal(
          <LightboxOverlay onClick={() => setLightboxOpen(false)}>
            <LightboxVideo onClick={(e) => e.stopPropagation()}>
              <video src={currentUrl} autoPlay controls onEnded={handleEnded} />
            </LightboxVideo>
          </LightboxOverlay>,
          document.body,
        )}
    </>
  );
}
