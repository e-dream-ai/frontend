import { FileState } from "@/constants/file.constants";
import { generateFileState } from "./file-uploader.util";
import { toast } from "react-toastify";
import { TFunction } from "i18next";

export const bytesToMegabytes = (bytes: number) => {
  return bytes / 1024 / 1024;
};

export const bytesToGB = (bytes: number): number => {
  const bytesPerGB = 1024 ** 3; // 2^30 bytes
  return bytes / bytesPerGB;
};

export const GBToBytes = (gb: number): number => {
  const bytesPerGB = 1024 ** 3; // 2^30 bytes
  return gb * bytesPerGB;
};

// Generic function to check and handle files
export const createAddFileHandler = (
  currentFiles: FileState[],
  setFiles: React.Dispatch<React.SetStateAction<FileState[]>>,
  t: TFunction,
) => {
  const handleAddFiles = (files: FileList | File) => {
    /**
     * Verify if adding single or multiple files
     */
    if (files instanceof FileList) {
      const filesArray = Array.from(files);

      const newFiles = filesArray.filter((file) => {
        const isDuplicate = currentFiles.some(
          (cFile) => cFile.name === file.name,
        );

        if (isDuplicate) {
          toast.warning(
            `"${file.name}" ${t("components.file_uploader.file_already_exists")}`,
          );
          return false;
        }
        return true;
      });

      setFiles((prev) => [
        ...prev,
        ...newFiles.map((f) => generateFileState(f)),
      ]);
    } else {
      const isDuplicate = currentFiles.some(
        (cFile) => cFile.name === files.name,
      );

      if (isDuplicate) {
        toast.warning(
          `"${files.name}" ${t("components.file_uploader.file_already_exists")}`,
        );
        return;
      }

      setFiles((prev) => [...prev, generateFileState(files)]);
    }
  };

  return handleAddFiles;
};
