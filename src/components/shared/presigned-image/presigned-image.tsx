import React from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/client/axios.client";
import { useImage } from "@/hooks/useImage";
import { ResizeOptions } from "@/types/image.types";

const fetchThumbnailUrl = (dreamUuid: string, mediaType: string) =>
  axiosClient
    .get<{ data?: { url?: string } }>(`/v1/dream/${dreamUuid}/${mediaType}`)
    .then((res) => res.data.data?.url);

interface PresignedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  dreamUuid: string;
  mediaType?: "thumbnail" | "video";
  resizeOptions?: ResizeOptions;
}

export const PresignedImage = React.forwardRef<
  HTMLImageElement,
  PresignedImageProps
>(({ dreamUuid, mediaType = "thumbnail", resizeOptions, ...imgProps }, ref) => {
  const { data: presignedUrl } = useQuery(
    ["dream-thumbnail", dreamUuid, mediaType],
    () => fetchThumbnailUrl(dreamUuid, mediaType),
    { staleTime: Infinity },
  );

  const imageUrl = useImage(presignedUrl, resizeOptions);

  if (!imageUrl) return null;
  return <img ref={ref} src={imageUrl} {...imgProps} />;
});

PresignedImage.displayName = "PresignedImage";
