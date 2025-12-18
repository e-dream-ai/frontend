import { FileState } from "@/constants/file.constants";
import { generateFileState } from "./file-uploader.util";

export const bytesToMegabytes = (bytes: number) => {
  return bytes / 1024 / 1024;
};

export const bytesToKilobytes = (bytes: number) => {
  return bytes / 1024;
};

export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return "0 B";

  const mb = bytesToMegabytes(bytes);

  if (mb < 1) {
    const kb = bytesToKilobytes(bytes);
    return `${Math.round(kb * 10) / 10} KB`;
  }

  return `${Math.round(mb * 10) / 10} MB`;
};

export const bytesToGB = (bytes: number): number => {
  const bytesPerGB = 1024 ** 3; // 2^30 bytes
  return bytes / bytesPerGB;
};

export const GBToBytes = (gb: number): number => {
  const bytesPerGB = 1024 ** 3; // 2^30 bytes
  return gb * bytesPerGB;
};

// Generic function to add files to state
export const createAddFileHandler = ({
  setFiles,
}: {
  setFiles: React.Dispatch<React.SetStateAction<FileState[]>>;
}) => {
  const handleAddFiles = (files: FileList | File) => {
    if (files instanceof FileList) {
      const filesArray = Array.from(files);
      setFiles((v) => [...v, ...filesArray.map((f) => generateFileState(f))]);
    } else {
      setFiles((v) => [...v, generateFileState(files)]);
    }
  };
  return handleAddFiles;
};
