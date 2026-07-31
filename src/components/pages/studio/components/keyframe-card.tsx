import React, { useState, useEffect, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, Crop } from "lucide-react";
import type { FlowKeyframe } from "@/types/flow.types";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import { useFlowStore } from "@/stores/flow.store";
import {
  type CropRegion,
  defaultCenterCrop,
  isFullFrameCrop,
} from "@/utils/aspect-crop";
import {
  CardWrapper,
  CardImage,
  CardPlaceholder,
  CardLabel,
  LoopBadge,
  DeleteButton,
  CropButton,
  CroppedBadge,
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
  /** Output aspect ratio (width / height); drives the card shape. */
  outputRatio: number;
  onDelete?: (id: string) => void;
  onEditCrop?: (id: string) => void;
}

/** Position/scale an <img> so its stored crop region fills the card (undistorted). */
function cropStyle(crop: CropRegion): React.CSSProperties {
  return {
    position: "absolute",
    width: `${100 / crop.width}%`,
    height: `${100 / crop.height}%`,
    left: `${(-100 * crop.x) / crop.width}%`,
    top: `${(-100 * crop.y) / crop.height}%`,
    maxWidth: "none",
    objectFit: "fill",
  };
}

export const KeyframeCard: React.FC<Props> = ({
  keyframe,
  index,
  outputRatio,
  onDelete,
  onEditCrop,
}) => {
  const isLoop = keyframe.isLoopKeyframe ?? false;
  const isUploading = keyframe.uploadStatus === "uploading";
  const isFailed = keyframe.uploadStatus === "failed";
  const isBusy = isUploading || isFailed;

  const updateKeyframe = useFlowStore((s) => s.updateKeyframe);
  const setKeyframeDimensions = useFlowStore((s) => s.setKeyframeDimensions);
  const [imgSrc, setImgSrc] = useState(keyframe.imageUrl);

  useEffect(() => {
    setImgSrc(keyframe.imageUrl);
  }, [keyframe.imageUrl]);

  const handleImgError = useCallback(async () => {
    if (!keyframe.dreamUuid) return;
    try {
      const headers = getRequestHeaders({ contentType: ContentType.json });
      const { data } = await axiosClient.get(
        `/v1/dream/${keyframe.dreamUuid}`,
        { headers },
      );
      const dream = data?.data?.dream;
      const freshUrl: string =
        dream?.video || dream?.original_video || dream?.thumbnail || "";
      if (freshUrl) {
        setImgSrc(freshUrl);
        if (!keyframe.isLoopKeyframe) {
          updateKeyframe(keyframe.id, { imageUrl: freshUrl });
        }
      }
    } catch {
      // Leave broken image rather than crashing
    }
  }, [
    keyframe.dreamUuid,
    keyframe.id,
    keyframe.isLoopKeyframe,
    updateKeyframe,
  ]);

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

  const navigateTarget = keyframe.dreamUuid
    ? `/dream/${keyframe.dreamUuid}`
    : keyframe.keyframeUuid
      ? `/keyframe/${keyframe.keyframeUuid}`
      : null;
  const isClickable = !isLoop && !isBusy && !!navigateTarget;
  const handleOpen = (e: React.MouseEvent) => {
    if (!navigateTarget) return;
    e.stopPropagation();
    window.open(navigateTarget, "_blank");
  };

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (isLoop) return; // loop card mirrors the first frame; dims live on the real one
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (
      naturalWidth &&
      naturalHeight &&
      (keyframe.naturalWidth !== naturalWidth ||
        keyframe.naturalHeight !== naturalHeight)
    ) {
      setKeyframeDimensions(keyframe.id, naturalWidth, naturalHeight);
    }
  };

  // Effective crop = the user's explicit crop, else a derived center crop for
  // the flow's output ratio. Frames whose source already matches the ratio come
  // out full-frame (untouched); only the odd-aspect frames are actually cropped.
  const effectiveCrop: CropRegion | undefined =
    keyframe.naturalWidth && keyframe.naturalHeight
      ? keyframe.crop ??
        defaultCenterCrop(
          keyframe.naturalWidth,
          keyframe.naturalHeight,
          outputRatio,
        )
      : undefined;
  const isCropped =
    !isLoop && !!effectiveCrop && !isFullFrameCrop(effectiveCrop);

  const imageStyle: React.CSSProperties = {
    ...(effectiveCrop ? cropStyle(effectiveCrop) : {}),
    ...(isClickable ? { cursor: "pointer" } : {}),
  };

  const canEditCrop = !isLoop && !isBusy && !!imgSrc && !!onEditCrop;

  return (
    <CardWrapper
      ref={setNodeRef}
      style={style}
      $loop={isLoop}
      $isDragging={isDragging}
      $uploading={isUploading}
      $failed={isFailed}
      $ratio={outputRatio}
      {...(isLoop || isBusy ? {} : { ...attributes, ...listeners })}
    >
      {imgSrc ? (
        <CardImage
          src={imgSrc}
          alt={keyframe.name}
          $uploading={isUploading}
          onClick={isClickable ? handleOpen : undefined}
          style={imageStyle}
          onLoad={handleImgLoad}
          onError={keyframe.dreamUuid ? handleImgError : undefined}
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

      {isCropped && !isBusy && (
        <CroppedBadge title="Cropped to match the flow's output shape">
          <Crop size={9} strokeWidth={2.4} /> cropped
        </CroppedBadge>
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

      {!isLoop && !isBusy && onDelete && (
        <DeleteButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(keyframe.id);
          }}
        >
          &times;
        </DeleteButton>
      )}

      {canEditCrop && (
        <CropButton
          aria-label={`Crop ${keyframe.name}`}
          title="Adjust crop"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onEditCrop?.(keyframe.id);
          }}
        >
          <Crop size={12} strokeWidth={2.2} />
        </CropButton>
      )}
    </CardWrapper>
  );
};
