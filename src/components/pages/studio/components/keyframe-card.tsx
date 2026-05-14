import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle } from "lucide-react";
import type { FlowKeyframe } from "@/types/flow.types";
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
} from "./keyframe-card.styled";

interface Props {
  keyframe: FlowKeyframe;
  index: number;
  onDelete?: (id: string) => void;
}

export const KeyframeCard: React.FC<Props> = ({
  keyframe,
  index,
  onDelete,
}) => {
  const isLoop = keyframe.isLoopKeyframe ?? false;
  const isUploading = keyframe.uploadStatus === "uploading";
  const isFailed = keyframe.uploadStatus === "failed";
  const isBusy = isUploading || isFailed;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: keyframe.id,
    // Dragging a card mid-upload would re-key React and abort the visual
    // continuity of the preview, so lock it until the upload settles.
    disabled: isLoop || isBusy,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const percent = Math.round(keyframe.uploadProgress ?? 0);

  return (
    <CardWrapper
      ref={setNodeRef}
      style={style}
      $loop={isLoop}
      $isDragging={isDragging}
      $uploading={isUploading}
      $failed={isFailed}
      {...(isLoop || isBusy ? {} : { ...attributes, ...listeners })}
    >
      {keyframe.imageUrl ? (
        <CardImage
          src={keyframe.imageUrl}
          alt={keyframe.name}
          $uploading={isUploading}
        />
      ) : (
        <CardPlaceholder>{keyframe.name}</CardPlaceholder>
      )}

      {isUploading && (
        <UploadOverlay
          role="progressbar"
          aria-label={`Uploading ${keyframe.name}`}
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
            {keyframe.name} <LoopBadge>Loop</LoopBadge>
          </>
        ) : (
          `${index + 1}`
        )}
      </CardLabel>

      {!isLoop && !isUploading && onDelete && (
        <DeleteButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(keyframe.id);
          }}
        >
          &times;
        </DeleteButton>
      )}
    </CardWrapper>
  );
};
