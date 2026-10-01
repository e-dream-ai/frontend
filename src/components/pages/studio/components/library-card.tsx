import React, { memo } from "react";
import { mediaAspectRatio } from "../utils/media-aspect-ratio";
import { CARD_THUMB, sizedImageUrl } from "../utils/sized-image";
import { Card, CardImg, CardName } from "./select-image-dream-modal.styled";

interface Props {
  uuid: string;
  name: string;
  thumbnail: string;
  width?: number;
  height?: number;
  onOpen: (uuid: string) => void;
}

const LibraryCardComponent: React.FC<Props> = ({
  uuid,
  name,
  thumbnail,
  width,
  height,
  onOpen,
}) => (
  <Card
    type="button"
    $selected={false}
    onClick={() => onOpen(uuid)}
    aria-label={name}
    title={name}
  >
    <CardImg
      src={sizedImageUrl(thumbnail, CARD_THUMB)}
      alt=""
      loading="lazy"
      $ratio={mediaAspectRatio(width, height)}
    />
    <CardName aria-hidden="true">{name}</CardName>
  </Card>
);

export const LibraryCard = memo(LibraryCardComponent);
