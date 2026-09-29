import React from "react";
import type { FlowReferenceFrame } from "@/types/flow.types";
import { useFlowStore } from "@/stores/flow.store";
import { useReferenceFrameImage } from "../hooks/useReferenceFrameImage";
import { StudioLightbox } from "./studio-lightbox";
import { ImageDetails } from "./image-details";

interface Props {
  /** The frame's prompt is loaded; open the generate dialog. */
  onRemix: () => void;
}

function ReferenceFrameLightboxDialog({
  openId,
  onRemix,
}: Props & { openId: string }) {
  const referenceFrames = useFlowStore((s) => s.referenceFrames);
  const close = useFlowStore((s) => s.closeFrameLightbox);
  const step = useFlowStore((s) => s.stepFrameLightbox);
  const removeReferenceFrame = useFlowStore((s) => s.removeReferenceFrame);

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
      details={
        // Only once it is a dream: a frame still uploading has none to read.
        frame.dreamUuid && !frame.uploadStatus ? (
          <ImageDetails
            dreamUuid={frame.dreamUuid}
            name={frame.name}
            onRemix={() => {
              close();
              onRemix();
            }}
            // Removing the open frame closes the lightbox, as its × on the
            // strip would.
            onDelete={() => removeReferenceFrame(frame.id)}
          />
        ) : undefined
      }
    >
      <img src={src} alt={frame.name} onError={onError} />
    </StudioLightbox>
  );
}

export const ReferenceFrameLightbox: React.FC<Props> = ({ onRemix }) => {
  const openId = useFlowStore((s) => s.frameLightboxId);
  return openId === null ? null : (
    <ReferenceFrameLightboxDialog openId={openId} onRemix={onRemix} />
  );
};
