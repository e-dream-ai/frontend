import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { FlowKeyframe } from "@/types/flow.types";
import { useFlowStore } from "@/stores/flow.store";
import { canStep } from "@/utils/keyframe-lightbox.util";
import { useLightboxA11y } from "../hooks/useLightboxA11y";
import { useKeyframeImage } from "../hooks/useKeyframeImage";
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

function KeyframeLightboxDialog({ openId }: { openId: string }) {
  const keyframes = useFlowStore((s) => s.keyframes);
  const close = useFlowStore((s) => s.closeKeyframeLightbox);
  const step = useFlowStore((s) => s.stepKeyframeLightbox);

  const count = keyframes.length;
  const index = keyframes.findIndex((kf) => kf.id === openId);
  const keyframe: FlowKeyframe | undefined = keyframes[index];
  const prevUrl = keyframes[index - 1]?.imageUrl;
  const nextUrl = keyframes[index + 1]?.imageUrl;

  const overlayRef = useLightboxA11y<HTMLDivElement>(close);
  const { src, onError } = useKeyframeImage(keyframe);

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

  if (!keyframe) return null;

  return createPortal(
    <Overlay
      ref={overlayRef}
      tabIndex={-1}
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
        disabled={!canStep(index, -1, count)}
        onClick={(e) => {
          e.stopPropagation();
          step(-1);
        }}
        aria-label="Previous keyframe"
      >
        <ChevronLeft size={22} strokeWidth={2.4} />
      </NavButton>

      <ImageFrame onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={keyframe.name} onError={onError} />
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
        disabled={!canStep(index, 1, count)}
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
}

export const KeyframeLightbox: React.FC = () => {
  const openId = useFlowStore((s) => s.keyframeLightboxId);
  return openId === null ? null : <KeyframeLightboxDialog openId={openId} />;
};
