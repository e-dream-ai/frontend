import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { canStep } from "@/utils/lightbox.util";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import {
  Overlay,
  ImageFrame,
  Caption,
  CaptionName,
  NavButton,
  CloseButton,
} from "./reference-frame-lightbox.styled";

interface Props {
  /** Position of the open item, and how many there are, for deciding
   *  whether the arrows can still step. */
  index: number;
  count: number;
  name: string;
  onClose: () => void;
  onStep: (delta: number) => void;
  /** Neighbouring full-size URLs to warm, when the caller knows them. */
  prevUrl?: string;
  nextUrl?: string;
  label?: string;
  /** Shown in place of the caption, e.g. the name, prompt and what can be
   *  done with it. */
  details?: React.ReactNode;
  /** The resolved image. Flow frames carry a URL; studio images may need a
   *  presigned fetch — so each caller renders its own <img>. */
  children: React.ReactNode;
}

/**
 * Lightbox chrome shared by the flow and action studios: portal, focus trap,
 * escape-to-close, arrow-key stepping, prev/next buttons, caption. Only the
 * close button and Escape close it; a stray click on the backdrop does not.
 * Only the image element differs between the two, so that comes in as
 * children rather than being resolved here.
 */
export const StudioLightbox: React.FC<Props> = ({
  index,
  count,
  name,
  onClose,
  onStep,
  prevUrl,
  nextUrl,
  label = "Image preview",
  details,
  children,
}) => {
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);

  useEffect(() => {
    for (const url of [prevUrl, nextUrl]) {
      if (!url) continue;
      const img = new Image();
      img.src = url;
    }
  }, [prevUrl, nextUrl]);

  const onStepRef = useRef(onStep);
  useEffect(() => {
    onStepRef.current = onStep;
  }, [onStep]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      onStepRef.current(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return createPortal(
    <Overlay
      ref={overlayRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <CloseButton onClick={onClose} aria-label="Close">
        &times;
      </CloseButton>

      <NavButton
        $side="left"
        disabled={!canStep(index, -1, count)}
        onClick={() => onStep(-1)}
        aria-label="Previous image"
      >
        <ChevronLeft size={22} strokeWidth={2.4} />
      </NavButton>

      <ImageFrame $compact={!!details}>{children}</ImageFrame>

      {/* Details carry the name themselves, on one line with its settings. */}
      {details ?? (
        <Caption>
          <CaptionName>{name}</CaptionName>
        </Caption>
      )}

      <NavButton
        $side="right"
        disabled={!canStep(index, 1, count)}
        onClick={() => onStep(1)}
        aria-label="Next image"
      >
        <ChevronRight size={22} strokeWidth={2.4} />
      </NavButton>
    </Overlay>,
    document.body,
  );
};
