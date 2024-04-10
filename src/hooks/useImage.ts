import { ResizeOptions } from "@/types/image.types";
import { BUCKET_URL, generateImageURL } from "@/utils/image-handler";
import { useState, useEffect, useRef } from "react";

export const useImage = (url?: string, resizeOptions?: ResizeOptions) => {
  const [generatedUrl, setGeneratedUrl] = useState<string | undefined>(
    undefined,
  );
  const prevUrlRef = useRef<string | undefined>();
  const prevResizeOptionsRef = useRef<ResizeOptions | undefined>();

  useEffect(() => {
    // Function to check if resize options have changed
    const resizeOptionsChanged = (
      prevOptions?: ResizeOptions,
      newOptions?: ResizeOptions,
    ) => {
      // Execute deep comparison if needed
      return JSON.stringify(prevOptions) !== JSON.stringify(newOptions);
    };

    // Only update if url or resizeOptions have changed
    if (
      prevUrlRef.current !== url ||
      resizeOptionsChanged(prevResizeOptionsRef.current, resizeOptions)
    ) {
      const objectKey = url?.replace(`${BUCKET_URL}/`, "");

      if (objectKey) {
        const newUrl =
          generateImageURL(objectKey, resizeOptions) +
          `?v=${new Date().getTime()}`;
        setGeneratedUrl(newUrl);
      } else {
        setGeneratedUrl(undefined);
      }

      // Update refs to current values
      prevUrlRef.current = url;
      prevResizeOptionsRef.current = resizeOptions;
    }
  }, [url, resizeOptions]); // Dependencies on url and resizeOptions to trigger effect

  return generatedUrl;
};
