import { Sizes } from "@/types/sizes.types";
import { useState, ImgHTMLAttributes, useEffect } from "react";
import { ImageSkeleton, StyledErrorContainer, StyledItemCardImage } from "./item-card.styled";

export const ItemCardImage: React.FC<ImgHTMLAttributes<unknown> & { size: Sizes }> = ({
  src,
  size = 'md',
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  // Preload the image
  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.src = src;

    img.onload = () => {
      // Only set the image source after it's loaded
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (isLoading) {
    return <ImageSkeleton size={size} />;
  }

  if (hasError) {
    return (
      <StyledErrorContainer>
        Image Not Available
      </StyledErrorContainer>
    );
  }

  return (
    <StyledItemCardImage
      src={imageSrc}
      size={size}
      {...props}
    />
  );
};