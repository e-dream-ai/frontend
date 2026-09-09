import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
} from "./segment-preview.styled";
import { CrossfadeVideo, type CrossfadeSegment } from "./crossfade-video";
import { useLightboxA11y } from "../hooks/useLightboxA11y";

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
}

function PreviewLightbox({
  segments,
  index,
  loop,
  ratio,
  onMeasured,
  onClose,
  onEnded,
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
        />
      </LightboxVideo>
    </LightboxOverlay>,
    document.body,
  );
}

export interface SegmentPreviewProps {
  segments: readonly CrossfadeSegment[];
  /**
   * Which segment is showing. Clamped here, so a caller holding an index that
   * outlived its segment renders the first one rather than a blank box.
   */
  index: number;
  onIndexChange: (index: number) => void;
  lightboxOpen: boolean;
  onLightboxOpenChange: (open: boolean) => void;
  label?: string;
  hint?: string;
  /** Suppress arrow-key stepping while another overlay owns the keyboard. */
  keyboardDisabled?: boolean;
  /** Which edge carries the separating rule: the flow preview sits at the
   *  bottom of its panel, the results preview at the top of its tab. */
  divider?: "top" | "bottom";
}

/**
 * Inline video player with prev/next arrows, a numbered chip rail and a
 * click-to-expand lightbox, shared by the flow builder and the action
 * studio's Results tab. Purely presentational: the caller supplies the
 * segments and owns the current index and lightbox state, so it can open the
 * lightbox on a particular clip (the results grid does this when a thumbnail
 * is clicked).
 */
export function SegmentPreview({
  segments,
  index,
  onIndexChange,
  lightboxOpen,
  onLightboxOpenChange,
  label = "Preview",
  hint = "Click to expand",
  keyboardDisabled = false,
  divider = "top",
}: SegmentPreviewProps) {
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

  const wrapperRef = useRef<HTMLDivElement>(null);

  const segmentCount = segments.length;
  // Clamped during render so segment churn never points at a dead index.
  const targetIndex = index >= segmentCount || index < 0 ? 0 : index;

  const goTo = useCallback(
    (next: number) => {
      if (segmentCount === 0) return;
      onIndexChange(((next % segmentCount) + segmentCount) % segmentCount);
    },
    [segmentCount, onIndexChange],
  );

  const advance = useCallback(() => {
    if (segmentCount > 1) goTo(targetIndex + 1);
  }, [goTo, targetIndex, segmentCount]);

  useEffect(() => {
    if (segmentCount < 2) return;
    if (keyboardDisabled) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const active = document.activeElement;
      const inWrapper = active && wrapperRef.current?.contains(active as Node);
      if (!inWrapper && !lightboxOpen) return;
      e.preventDefault();
      goTo(targetIndex + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [segmentCount, keyboardDisabled, lightboxOpen, targetIndex, goTo]);

  if (segmentCount === 0) return null;

  const showNav = segmentCount > 1;
  const targetSegment = segments[targetIndex];
  const targetRatio = measuredRatios[targetSegment.key] ?? targetSegment.ratio;

  return (
    <>
      <PreviewContainer $divider={divider}>
        <PreviewLabel>{label}</PreviewLabel>

        <VideoWrapper
          ref={wrapperRef}
          tabIndex={0}
          $ratio={targetRatio}
          onClick={() => onLightboxOpenChange(true)}
        >
          <CrossfadeVideo
            segments={segments}
            index={targetIndex}
            onMeasured={handleMeasured}
            active={!lightboxOpen}
            muted
            loop={segmentCount === 1}
            onEnded={advance}
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

        <ClickHint>{hint}</ClickHint>
      </PreviewContainer>

      {lightboxOpen && (
        <PreviewLightbox
          segments={segments}
          index={targetIndex}
          loop={segmentCount === 1}
          ratio={targetRatio}
          onMeasured={handleMeasured}
          onClose={() => onLightboxOpenChange(false)}
          onEnded={advance}
        />
      )}
    </>
  );
}
