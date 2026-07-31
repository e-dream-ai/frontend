import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFlowStore } from "@/stores/flow.store";
import { canStep } from "../utils/keyframe-lightbox.util";
import {
  Overlay,
  ImageFrame,
  Caption,
  CaptionName,
  Counter,
  NavButton,
  CloseButton,
} from "./keyframe-lightbox.styled";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Full-screen lightbox for a flow keyframe (#694). Click a keyframe card to
 * open it here; ←/→ (or the on-screen arrows) move between keyframes, Escape /
 * backdrop / × closes. Navigation clamps at the ends. The synthetic loop frame
 * is never clickable, so this only ever shows real keyframes.
 */
export const KeyframeLightbox: React.FC = () => {
  const keyframes = useFlowStore((s) => s.keyframes);
  const index = useFlowStore((s) => s.keyframeLightboxIndex);
  const close = useFlowStore((s) => s.closeKeyframeLightbox);
  const step = useFlowStore((s) => s.stepKeyframeLightbox);

  const count = keyframes.length;
  const isOpen = index !== null;

  // Keyboard: Escape closes, arrows navigate (only while open).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, step]);

  // Lock body scroll while the lightbox is open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // If the underlying keyframe vanished (deleted while open), close.
  const keyframe = index !== null ? keyframes[index] : undefined;
  useEffect(() => {
    if (isOpen && !keyframe) close();
  }, [isOpen, keyframe, close]);

  if (index === null || !keyframe) return null;

  const canPrev = canStep(index, -1, count);
  const canNext = canStep(index, 1, count);

  return createPortal(
    <Overlay
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Keyframe preview"
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
        disabled={!canPrev}
        onClick={(e) => {
          e.stopPropagation();
          step(-1);
        }}
        aria-label="Previous keyframe"
      >
        <ChevronLeft size={22} strokeWidth={2.4} />
      </NavButton>

      <ImageFrame onClick={(e) => e.stopPropagation()}>
        <img src={keyframe.imageUrl} alt={keyframe.name} />
      </ImageFrame>

      <Caption onClick={(e) => e.stopPropagation()}>
        <CaptionName>{keyframe.name}</CaptionName>
        {count > 1 && (
          <Counter>
            {pad(index + 1)} / {pad(count)}
          </Counter>
        )}
      </Caption>

      <NavButton
        $side="right"
        disabled={!canNext}
        onClick={(e) => {
          e.stopPropagation();
          step(1);
        }}
        aria-label="Next keyframe"
      >
        <ChevronRight size={22} strokeWidth={2.4} />
      </NavButton>
    </Overlay>,
    document.body,
  );
};
