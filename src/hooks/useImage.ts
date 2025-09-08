import { ResizeOptions } from "@/types/image.types";
import { useMemo } from "react";

export const useImage = (url?: string, resizeOptions?: ResizeOptions) => {
  console.log("resizeOptions", resizeOptions);
  return useMemo(() => {
    return url;
  }, [url]);
};
