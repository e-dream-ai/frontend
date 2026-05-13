import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FlowKeyframe } from "@/types/flow.types";
import {
  CardWrapper,
  CardImage,
  CardPlaceholder,
  CardLabel,
  LoopBadge,
  DeleteButton,
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: keyframe.id,
    disabled: isLoop,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <CardWrapper
      ref={setNodeRef}
      style={style}
      $loop={isLoop}
      $isDragging={isDragging}
      {...(isLoop ? {} : { ...attributes, ...listeners })}
    >
      {keyframe.imageUrl ? (
        <CardImage src={keyframe.imageUrl} alt={keyframe.name} />
      ) : (
        <CardPlaceholder>{keyframe.name}</CardPlaceholder>
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

      {!isLoop && onDelete && (
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
