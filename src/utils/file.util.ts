import { FileState } from "@/constants/file.constants";
import {
  generateFileState,
  getFileNameWithoutExtension,
} from "./file-uploader.util";
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
export const createAddFileHandler = ({
  currentFiles,
  setFiles,
  t,
  extraFiles,
}: {
  currentFiles: FileState[];
  setFiles: React.Dispatch<React.SetStateAction<FileState[]>>;
  t: TFunction;
  extraFiles?: string[];
}) => {
  const handleAddFiles = (files: FileList | File) => {
    /**
     * Verify if adding single or multiple files
     */
    if (files instanceof FileList) {
      const filesArray = Array.from(files);

      const newFiles = filesArray.filter((file) => {
        const isDuplicate =
          currentFiles.some((cFile) => cFile.name === file.name) ||
          extraFiles?.some(
            (cFile) => cFile === getFileNameWithoutExtension(file),
          );

        if (isDuplicate) {
          toast.warning(
            `"${getFileNameWithoutExtension(file)}" ${t(
              "components.file_uploader.file_already_exists",
            )}`,
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
      const isDuplicate =
        currentFiles.some((cFile) => cFile.name === files.name) ||
        extraFiles?.some(
          (cFile) => cFile === getFileNameWithoutExtension(files),
        );

      if (isDuplicate) {
        toast.warning(
          `"${getFileNameWithoutExtension(files)}" ${t(
            "components.file_uploader.file_already_exists",
          )}`,
        );
        return;
      }

      setFiles((prev) => [...prev, generateFileState(files)]);
    }
  };

  return handleAddFiles;
};

// Function to remove duplicated files from state
export const removeDuplicateHandler = ({
  currentFiles,
  setFiles,
  t,
  extraFiles,
}: {
  currentFiles: FileState[];
  setFiles: React.Dispatch<React.SetStateAction<FileState[]>>;
  t: TFunction;
  extraFiles?: string[];
}) => {
  const uniqueFiles = currentFiles.reduce((acc, file) => {
    const isDuplicated =
      acc.some((f) => f.name === getFileNameWithoutExtension(file.fileBlob)) ||
      extraFiles?.some(
        (ef) => ef === getFileNameWithoutExtension(file.fileBlob),
      );

    if (isDuplicated) {
      toast.warning(
        `"${getFileNameWithoutExtension(file.fileBlob)}" ${t(
          "components.file_uploader.file_already_exists",
        )}`,
      );
      return acc;
    }
    return [...acc, file];
  }, [] as FileState[]);

  setFiles(uniqueFiles);
};
