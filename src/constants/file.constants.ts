// MAX_FILE_SIZE_MB 16GB
export const MAX_FILE_SIZE_MB = 16 * 1024;

export const FILE_FORM = {
  FILE: "file",
};

export const ALLOWED_VIDEO_TYPES = ["MP4"];

export type FileState = {
  fileBlob: File;
  url: string;
  name?: string;
  uploaded?: boolean;
  failed?: boolean;
};
