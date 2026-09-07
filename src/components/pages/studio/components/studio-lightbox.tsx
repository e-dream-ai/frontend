import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { canStep } from "@/utils/lightbox.util";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import {
  Overlay,
  ImageFrame,
  Caption,
  CaptionName,
  Counter,
  NavButton,
  CloseButton,
} from "./reference-frame-lightbox.styled";

const pad = (n: number) => String(n).padStart(2, "0");

interface Props {
  /** Position of the open item, and how many there are, for the counter and
   *  for deciding whether the arrows can still step. */
  index: number;
  count: number;
  name: string;
  onClose: () => void;
  onStep: (delta: number) => void;
  /** Neighbouring full-size URLs to warm, when the caller knows them. */
  preloadUrls?: (string | undefined)[];
  label?: string;
  /** The resolved image. Flow frames carry a URL; studio images may need a
   *  presigned fetch — so each caller renders its own <img>. */
  children: React.ReactNode;
}

/**
 * Lightbox chrome shared by the flow and action studios: portal, focus trap,
 * escape-to-close, arrow-key stepping, prev/next buttons, caption + counter.
 * Only the image element differs between the two, so that comes in as
 * children rather than being resolved here.
 */
export const StudioLightbox: React.FC<Props> = ({
  index,
  count,
  name,
  onClose,
  onStep,
  preloadUrls,
  label = "Image preview",
  children,
}) => {
  const overlayRef = useLightboxA11y<HTMLDivElement>(onClose);

  const warm = preloadUrls?.join("|");
  useEffect(() => {
    if (!warm) return;
    for (const url of warm.split("|")) {
      if (!url) continue;
      const img = new Image();
      img.src = url;
    }
  }, [warm]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      onStep(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStep]);

  return createPortal(
    <Overlay
      ref={overlayRef}
      tabIndex={-1}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <CloseButton
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
      >
        &times;
      </CloseButton>

      <NavButton
        $side="left"
        disabled={!canStep(index, -1, count)}
        onClick={(e) => {
          e.stopPropagation();
          onStep(-1);
        }}
        aria-label="Previous image"
      >
        <ChevronLeft size={22} strokeWidth={2.4} />
      </NavButton>

      <ImageFrame onClick={(e) => e.stopPropagation()}>{children}</ImageFrame>

      <Caption onClick={(e) => e.stopPropagation()}>
        <CaptionName>{name}</CaptionName>
        {count > 1 && (
          <Counter>
            {pad(index + 1)} / {pad(count)}
          </Counter>
        )}
      </Caption>

      <NavButton
        $side="right"
        disabled={!canStep(index, 1, count)}
        onClick={(e) => {
          e.stopPropagation();
          onStep(1);
        }}
        aria-label="Next image"
      >
        <ChevronRight size={22} strokeWidth={2.4} />
      </NavButton>
    </Overlay>,
    document.body,
  );
};
