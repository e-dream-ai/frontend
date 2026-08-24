import React, { memo } from "react";
import { Dream } from "@/types/dream.types";
import { mediaAspectRatio } from "../utils/media-aspect-ratio";
import {
  Card,
  CardImg,
  CardCheckmark,
  CardName,
} from "./select-image-dream-modal.styled";

interface Props {
  dream: Dream;
  made: string;
  isSelected: boolean;
  alreadyAdded: boolean;
  onToggle: (uuid: string) => void;
}

const SelectImageDreamCardComponent: React.FC<Props> = ({
  dream,
  made,
  isSelected,
  alreadyAdded,
  onToggle,
}) => {
  const imageUrl = dream.thumbnail || dream.video || dream.original_video || "";
  const label = alreadyAdded ? `${made} — already in strip` : made;

  return (
    <Card
      type="button"
      aria-pressed={isSelected}
      aria-disabled={alreadyAdded || undefined}
      aria-label={`${dream.name}, ${label}`}
      tabIndex={alreadyAdded ? -1 : 0}
      $selected={isSelected}
      $disabled={alreadyAdded}
      onClick={() => !alreadyAdded && onToggle(dream.uuid)}
      title={label}
    >
      {imageUrl && (
        <CardImg
          src={imageUrl}
          alt=""
          $ratio={mediaAspectRatio(
            dream.processedMediaWidth,
            dream.processedMediaHeight,
          )}
        />
      )}
      {isSelected && <CardCheckmark aria-hidden="true">✓</CardCheckmark>}
      <CardName aria-hidden="true">{dream.name}</CardName>
    </Card>
  );
};

export const SelectImageDreamCard = memo(SelectImageDreamCardComponent);
