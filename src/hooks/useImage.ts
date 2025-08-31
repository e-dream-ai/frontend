import { useMemo } from "react";
import { ResizeOptions } from "@/types/image.types";
import { generateCloudflareImageURL } from "@/utils/image-handler";

export const useImage = (url?: string, resizeOptions?: ResizeOptions) => {
  return useMemo(() => {
    return url ? generateCloudflareImageURL(url, resizeOptions) : undefined;
  }, [url, resizeOptions]);
};
