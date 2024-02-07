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
