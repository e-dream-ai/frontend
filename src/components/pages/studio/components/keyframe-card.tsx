import React, { useState, useEffect, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, Shuffle } from "lucide-react";
import type { FlowKeyframe } from "@/types/flow.types";
import { axiosClient } from "@/client/axios.client";
import { getRequestHeaders, ContentType } from "@/constants/auth.constants";
import { useFlowStore } from "@/stores/flow.store";
import {
  CardWrapper,
  CardImage,
  CardPlaceholder,
  CardLabel,
  LoopBadge,
  CandidateBadge,
  DeleteButton,
  VaryButton,
  CandidateActions,
  AcceptButton,
  DiscardButton,
  UploadOverlay,
  UploadRing,
  UploadRingTrack,
  UploadRingFill,
  UploadPercent,
  FailedOverlay,
  CandidateFailedOverlay,
  GeneratingOverlay,
  GeneratingSpinner,
  GeneratingLabel,
} from "./keyframe-card.styled";

interface Props {
  keyframe: FlowKeyframe;
  index: number;
  onDelete?: (id: string) => void;
  onRequestI2iVariation?: (keyframe: FlowKeyframe) => void;
  onAcceptI2iCandidate?: (keyframe: FlowKeyframe) => void;
  onDiscardI2iCandidate?: (keyframe: FlowKeyframe) => void;
}

export const KeyframeCard: React.FC<Props> = ({
  keyframe,
  index,
  onDelete,
  onRequestI2iVariation,
  onAcceptI2iCandidate,
  onDiscardI2iCandidate,
}) => {
  const isLoop = keyframe.isLoopKeyframe ?? false;
  const isCandidate = keyframe.i2iCandidate ?? false;
  const isUploading = keyframe.uploadStatus === "uploading";
  const isFailed = keyframe.uploadStatus === "failed";
  const isBusy = isUploading || isFailed;
  // A candidate whose own dream is still rendering. Show a loader instead of the
  // placeholder source image (which is identical across a batch and reads as
  // frozen); job progress swaps in the distinct result once processed.
  const isGenerating =
    isCandidate &&
    (keyframe.i2iStatus === "queue" || keyframe.i2iStatus === "processing");
  // A candidate whose generation failed. Surface it as failed rather than
  // silently falling back to the source image (which is identical across the
  // batch and reads as "nothing happened / they all look the same").
  const isGenFailed = isCandidate && keyframe.i2iStatus === "failed";

  const updateKeyframe = useFlowStore((s) => s.updateKeyframe);

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
    // i2i candidates live in a separate staging row and are not part of the
    // timeline, so reordering them is meaningless — keep them non-draggable.
    disabled: isLoop || isBusy || isCandidate,
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

  return (
    <CardWrapper
      ref={setNodeRef}
      style={style}
      $loop={isLoop}
      $isDragging={isDragging}
      $uploading={isUploading}
      $failed={isFailed}
      $candidate={isCandidate}
      {...(isLoop || isBusy || isCandidate
        ? {}
        : { ...attributes, ...listeners })}
    >
      {imgSrc ? (
        <CardImage
          src={imgSrc}
          alt={keyframe.name}
          $uploading={isUploading}
          onClick={isClickable ? handleOpen : undefined}
          style={isClickable ? { cursor: "pointer" } : undefined}
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

      {isGenerating && (
        <GeneratingOverlay role="status" aria-label="Generating variation">
          <GeneratingSpinner />
          <GeneratingLabel>Generating…</GeneratingLabel>
        </GeneratingOverlay>
      )}

      {isGenFailed && (
        <CandidateFailedOverlay role="alert">
          <AlertTriangle size={16} strokeWidth={2.2} />
          Variation failed
        </CandidateFailedOverlay>
      )}

      {/* Index / loop label sits bottom-left. Not shown for candidates —
          they get their own top-left badge so it can't collide with the
          bottom-right Accept/Discard actions on narrow cards. */}
      {!isCandidate && (
        <CardLabel>
          {isLoop ? (
            <>
              {keyframe.name} <LoopBadge>Loop</LoopBadge>
            </>
          ) : (
            `${index + 1}`
          )}
        </CardLabel>
      )}

      {/* Candidate badge: top-left, hidden while busy so the full-card
          progress/failed overlay owns the card. */}
      {isCandidate && !isBusy && !isGenFailed && (
        <CandidateBadge>Variation</CandidateBadge>
      )}

      {isCandidate &&
        !isBusy &&
        !isGenerating &&
        (onAcceptI2iCandidate || onDiscardI2iCandidate) && (
          <CandidateActions>
            {onAcceptI2iCandidate && !isGenFailed && (
              <AcceptButton
                title="Accept this variation as a keyframe"
                onClick={(e) => {
                  e.stopPropagation();
                  onAcceptI2iCandidate(keyframe);
                }}
              >
                Accept
              </AcceptButton>
            )}
            {onDiscardI2iCandidate && (
              <DiscardButton
                title="Discard this variation"
                onClick={(e) => {
                  e.stopPropagation();
                  onDiscardI2iCandidate(keyframe);
                }}
              >
                Discard
              </DiscardButton>
            )}
          </CandidateActions>
        )}

      {!isLoop && !isCandidate && !isBusy && onDelete && (
        <DeleteButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete(keyframe.id);
          }}
        >
          &times;
        </DeleteButton>
      )}

      {!isLoop && !isCandidate && !isBusy && onRequestI2iVariation && (
        <VaryButton
          title="Generate variations"
          onClick={(e) => {
            e.stopPropagation();
            onRequestI2iVariation(keyframe);
          }}
        >
          <Shuffle size={12} />
        </VaryButton>
      )}
    </CardWrapper>
  );
};
