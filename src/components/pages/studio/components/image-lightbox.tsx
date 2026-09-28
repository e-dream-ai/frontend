import React, { useCallback } from "react";
import type { StudioImage } from "@/types/studio.types";
import { PresignedImage } from "@/components/shared/presigned-image";
import { StudioLightbox } from "./studio-lightbox";
import { ImageDetails } from "./image-details";

interface Props {
  images: StudioImage[];
  openUuid: string;
  onClose: () => void;
  onOpenChange: (uuid: string) => void;
  /** The frame's prompt is loaded; open the generate dialog. */
  onRemix: () => void;
  onDelete: (uuid: string) => void;
}

const directUrlOf = (image?: StudioImage) =>
  image?.url.startsWith("http") ? image.url : undefined;

/**
 * Action-studio lightbox. Shares all of its chrome with the flow app via
 * StudioLightbox; only image resolution differs — uploads keep a direct URL,
 * while generated dreams need a presigned fetch by UUID (thumbnail only —
 * the API exposes no /dream/:uuid/video route).
 */
export const ImageLightbox: React.FC<Props> = ({
  images,
  openUuid,
  onClose,
  onOpenChange,
  onRemix,
  onDelete,
}) => {
  const index = images.findIndex((img) => img.uuid === openUuid);
  const image = images[index];

  const handleStep = useCallback(
    (delta: number) => {
      const next = images[index + delta];
      if (next) onOpenChange(next.uuid);
    },
    [images, index, onOpenChange],
  );

  if (!image) return null;

  return (
    <StudioLightbox
      index={index}
      count={images.length}
      name={image.name}
      onClose={onClose}
      onStep={handleStep}
      label="Reference frame preview"
      prevUrl={directUrlOf(images[index - 1])}
      nextUrl={directUrlOf(images[index + 1])}
      details={
        <ImageDetails
          dreamUuid={image.uuid}
          name={image.name}
          onRemix={onRemix}
          onDelete={() => onDelete(image.uuid)}
        />
      }
    >
      {directUrlOf(image) ? (
        <img src={image.url} alt={image.name} />
      ) : (
        <PresignedImage dreamUuid={image.uuid} alt={image.name} />
      )}
    </StudioLightbox>
  );
};
