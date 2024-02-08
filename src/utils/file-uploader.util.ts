import { FileState } from "@/constants/file.constants";
import type { TFunction } from "i18next";
import { toast } from "react-toastify";

export const handleFileUploaderSizeError = (t: TFunction) => () => {
  toast.error(t("components.file_uploader.size_error"));
};

export const handleFileUploaderTypeError = (t: TFunction) => () => {
  toast.error(t("components.file_uploader.type_error"));
};

export const getFileState = (file: File): FileState => ({
  name: file?.name,
  fileBlob: file,
  url: URL.createObjectURL(file),
});

export const getFileExtension = (file?: File): string => {
  const fileName = file?.name ?? "";
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex !== -1) {
    return fileName.slice(dotIndex + 1).toLowerCase();
  } else {
    return ""; // No extension found
  }
};

export const getFileNameWithoutExtension = (file?: File): string => {
  const fileName = file?.name ?? "";
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex !== -1) {
    return fileName.slice(0, dotIndex);
  } else {
    return fileName; // No extension found, return the entire file name
  }
};
