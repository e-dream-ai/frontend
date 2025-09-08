import { useMemo } from "react";

export const useImage = (url?: string) => {
  return useMemo(() => {
    return url;
  }, [url]);
};
