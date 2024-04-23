import { ResizeOptions } from "@/types/image.types";
import { BUCKET_URL, generateImageURL } from "@/utils/image-handler";
import { useState, useEffect, useRef, useCallback } from "react";

export const useImage = (url?: string, resizeOptions?: ResizeOptions) => {
  const [generatedUrl, setGeneratedUrl] = useState<string | undefined>(
    undefined,
  );
  const prevUrlRef = useRef<string | undefined>();
  const prevResizeOptionsRef = useRef<ResizeOptions | undefined>();

  // Function to check if resize options have changed
  const resizeOptionsChanged = useCallback(
    (prevOptions?: ResizeOptions, newOptions?: ResizeOptions) => {
      return JSON.stringify(prevOptions) !== JSON.stringify(newOptions);
    },
    [],
  );

  useEffect(() => {
    // Function to generate new URL if conditions are met
    const updateURL = () => {
      const objectKey = url?.replace(`${BUCKET_URL}/`, "");
      if (objectKey) {
        return (
          generateImageURL(objectKey, resizeOptions) +
          `?v=${new Date().getTime()}`
        );
      }
      return undefined;
    };

    if (
      prevUrlRef.current !== url ||
      resizeOptionsChanged(prevResizeOptionsRef.current, resizeOptions)
    ) {
      setGeneratedUrl(updateURL());

      // Update refs to current values
      prevUrlRef.current = url;
      prevResizeOptionsRef.current = resizeOptions;
    }
  }, [url, resizeOptions, resizeOptionsChanged]); // Correct dependency array

  return generatedUrl;
};
