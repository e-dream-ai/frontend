import { useMemo } from "react";

export const useVideo = (url?: string) => {
  return useMemo(() => {
    if (!url) return undefined;
    return url.startsWith("http") ? url : `https://${url}`;
  }, [url]);
};
