import { Sizes } from "@/types/sizes.types";
import { useState, ImgHTMLAttributes, useCallback } from "react";
import { ImageSkeleton, StyledErrorContainer, StyledItemCardImage } from "./item-card.styled";

export const ItemCardImage: React.FC<ImgHTMLAttributes<unknown> & { size: Sizes }> = ({
  src,
  size = "md",
  alt = "",
  ...props
}) => {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(() => src ? "loading" : "error");

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    // Verify the image is actually valid
    if (e.currentTarget.naturalWidth === 0) {
      setStatus("error");
      return;
    }
    setStatus("loaded");
    props.onLoad?.(e);
  }, [props]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setStatus("error");
    props.onError?.(e);
  }, [props]);

  if (status === "loading") {
    return (
      <>
        <ImageSkeleton size={size} />
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{ display: "none" }}
          {...props}
        />
      </>
    );
  }

  if (status === "error") {
    return (
      <StyledErrorContainer size={size}>
        Image Not Available
      </StyledErrorContainer>
    );
  }

  return (
    <StyledItemCardImage
      src={src}
      size={size}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
};