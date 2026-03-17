import React from "react";
import { URL } from "@/constants/api.constants";

export const getPresignedUrl = (
  dreamUuid: string,
  mediaType: "thumbnail" | "video" = "thumbnail",
): string => `${URL}/v1/dream/${dreamUuid}/${mediaType}`;

interface PresignedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  dreamUuid: string;
  mediaType?: "thumbnail" | "video";
}

export const PresignedImage = React.forwardRef<
  HTMLImageElement,
  PresignedImageProps
>(({ dreamUuid, mediaType = "thumbnail", ...imgProps }, ref) => (
  <img ref={ref} src={getPresignedUrl(dreamUuid, mediaType)} {...imgProps} />
));

PresignedImage.displayName = "PresignedImage";
