import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle } from "lucide-react";
import type { FlowReferenceFrame } from "@/types/flow.types";
import { useFlowStore } from "@/stores/flow.store";
import { aspectRatioOf } from "../utils/frame-aspect";
import { useReferenceFrameImage } from "../hooks/useReferenceFrameImage";
import {
  CardWrapper,
  CardImage,
  CardPlaceholder,
  CardLabel,
  LoopBadge,
  DeleteButton,
  UploadOverlay,
  UploadRing,
  UploadRingTrack,
  UploadRingFill,
  UploadPercent,
  FailedOverlay,
} from "./reference-frame-card.styled";

interface Props {
  frame: FlowReferenceFrame;
  index: number;
  onDelete?: (id: string) => void;
}

export const ReferenceFrameCard: React.FC<Props> = ({
  frame,
  index,
  onDelete,
}) => {
  const isLoop = frame.isLoopFrame ?? false;
  const isUploading = frame.uploadStatus === "uploading";
  const isFailed = frame.uploadStatus === "failed";
  const isBusy = isUploading || isFailed;

  const { src: imgSrc, onError: handleImgError } =
    useReferenceFrameImage(frame);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: frame.id,
    // Dragging a card mid-upload would re-key React and abort the visual
    // continuity of the preview, so lock it until the upload settles.
    disabled: isLoop || isBusy,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const percent = Math.round(frame.uploadProgress ?? 0);

  const openFrameLightbox = useFlowStore((s) => s.openFrameLightbox);
  const updateReferenceFrame = useFlowStore((s) => s.updateReferenceFrame);
  const isClickable = !isLoop && !isBusy && !!imgSrc;

  // The image is the only place the source's true shape is known: uploads are
  // local blobs and library picks carry no dimensions on the flow frame.
  // The loop frame is a synthetic copy of the first, so it has no store row to
  // write back to — the frame it mirrors reports its own size.
  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (isLoop) return;
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    if (
      frame.naturalWidth === naturalWidth &&
      frame.naturalHeight === naturalHeight
    ) {
      return;
    }
    updateReferenceFrame(frame.id, { naturalWidth, naturalHeight });
  };
  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    openFrameLightbox(frame.id);
  };

  return (
    <CardWrapper
      ref={setNodeRef}
      style={style}
      $loop={isLoop}
      $isDragging={isDragging}
      $uploading={isUploading}
      $failed={isFailed}
      $ratio={aspectRatioOf(frame)}
      {...(isLoop || isBusy ? {} : { ...attributes, ...listeners })}
    >
      {imgSrc ? (
        <CardImage
          src={imgSrc}
          alt={frame.name}
          $uploading={isUploading}
          onClick={isClickable ? handleOpen : undefined}
          style={isClickable ? { cursor: "pointer" } : undefined}
          onLoad={handleImgLoad}
          onError={handleImgError}
        />
      ) : (
        <CardPlaceholder>{frame.name}</CardPlaceholder>
      )}

      {isUploading && (
        <UploadOverlay
          role="progressbar"
          aria-label={`Uploading ${frame.name}`}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <UploadRing viewBox="0 0 36 36">
            <UploadRingTrack cx="18" cy="18" r="16" />
            <UploadRingFill cx="18" cy="18" r="16" $percent={percent} />
          </UploadRing>
          <UploadPercent>{percent}%</UploadPercent>
        </UploadOverlay>
      )}

      {isFailed && (
        <FailedOverlay role="alert">
          <AlertTriangle size={16} strokeWidth={2.2} />
          Upload failed
        </FailedOverlay>
      )}

      <CardLabel>
        {isLoop ? (
          <>
            {frame.name} <LoopBadge>Loop</LoopBadge>
          </>
        ) : (
          `${index + 1}`
        )}
      </CardLabel>

      {!isLoop && !isBusy && onDelete && (
        <DeleteButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(frame.id);
          }}
        >
          &times;
        </DeleteButton>
      )}
    </CardWrapper>
  );
};
