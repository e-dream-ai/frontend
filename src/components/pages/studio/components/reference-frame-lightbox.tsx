import React from "react";
import type { FlowReferenceFrame } from "@/types/flow.types";
import { useFlowStore } from "@/stores/flow.store";
import { useReferenceFrameImage } from "../hooks/useReferenceFrameImage";
import { StudioLightbox } from "./studio-lightbox";

function ReferenceFrameLightboxDialog({ openId }: { openId: string }) {
  const referenceFrames = useFlowStore((s) => s.referenceFrames);
  const close = useFlowStore((s) => s.closeFrameLightbox);
  const step = useFlowStore((s) => s.stepFrameLightbox);

  const count = referenceFrames.length;
  const index = referenceFrames.findIndex((frame) => frame.id === openId);
  const frame: FlowReferenceFrame | undefined = referenceFrames[index];

  const { src, onError } = useReferenceFrameImage(frame);

  if (!frame) return null;

  return (
    <StudioLightbox
      index={index}
      count={count}
      name={frame.name}
      onClose={close}
      onStep={step}
      label="Reference frame preview"
      prevUrl={referenceFrames[index - 1]?.imageUrl}
      nextUrl={referenceFrames[index + 1]?.imageUrl}
    >
      <img src={src} alt={frame.name} onError={onError} />
    </StudioLightbox>
  );
}

export const ReferenceFrameLightbox: React.FC = () => {
  const openId = useFlowStore((s) => s.frameLightboxId);
  return openId === null ? null : (
    <ReferenceFrameLightboxDialog openId={openId} />
  );
};
