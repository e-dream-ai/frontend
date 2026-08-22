import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FlowReferenceFrame } from "@/types/flow.types";
import { useFlowStore } from "@/stores/flow.store";
import { canStep } from "@/utils/lightbox.util";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import { useReferenceFrameImage } from "../hooks/useReferenceFrameImage";
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

function ReferenceFrameLightboxDialog({ openId }: { openId: string }) {
  const referenceFrames = useFlowStore((s) => s.referenceFrames);
  const close = useFlowStore((s) => s.closeFrameLightbox);
  const step = useFlowStore((s) => s.stepFrameLightbox);

  const count = referenceFrames.length;
  const index = referenceFrames.findIndex((frame) => frame.id === openId);
  const frame: FlowReferenceFrame | undefined = referenceFrames[index];
  const prevUrl = referenceFrames[index - 1]?.imageUrl;
  const nextUrl = referenceFrames[index + 1]?.imageUrl;

  const overlayRef = useLightboxA11y<HTMLDivElement>(close);
  const { src, onError } = useReferenceFrameImage(frame);

  // Warm the adjacent full-size images (not the thumbnails the strip loaded).
  useEffect(() => {
    for (const url of [prevUrl, nextUrl]) {
      if (!url) continue;
      const img = new Image();
      img.src = url;
    }
  }, [prevUrl, nextUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  if (!frame) return null;

  return createPortal(
    <Overlay
      ref={overlayRef}
      tabIndex={-1}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Reference frame preview"
    >
      <CloseButton
        onClick={(e) => {
          e.stopPropagation();
          close();
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
          step(-1);
        }}
        aria-label="Previous reference frame"
      >
        <ChevronLeft size={22} strokeWidth={2.4} />
      </NavButton>

      <ImageFrame onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={frame.name} onError={onError} />
      </ImageFrame>

      <Caption onClick={(e) => e.stopPropagation()}>
        <CaptionName>{frame.name}</CaptionName>
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
          step(1);
        }}
        aria-label="Next reference frame"
      >
        <ChevronRight size={22} strokeWidth={2.4} />
      </NavButton>
    </Overlay>,
    document.body,
  );
}

export const ReferenceFrameLightbox: React.FC = () => {
  const openId = useFlowStore((s) => s.frameLightboxId);
  return openId === null ? null : (
    <ReferenceFrameLightboxDialog openId={openId} />
  );
};
