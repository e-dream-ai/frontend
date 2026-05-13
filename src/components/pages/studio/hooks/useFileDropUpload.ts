import { useState, useCallback, type DragEvent } from "react";

interface UseFileDropUploadOptions {
  accept: string[];
  onFiles: (files: File[]) => void;
}

export const useFileDropUpload = ({
  accept,
  onFiles,
}: UseFileDropUploadOptions) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        accept.some((type) => f.type === type),
      );
      if (files.length > 0) onFiles(files);
    },
    [accept, onFiles],
  );

  return {
    isDragOver,
    dropHandlers: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
};
