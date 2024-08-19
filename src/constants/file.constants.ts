// MAX_FILE_SIZE_MB 16GB
export const MAX_FILE_SIZE_MB = 50 * 1024;

export const FILE_FORM = {
  FILE: "file",
};

export const ALLOWED_VIDEO_TYPES = [
  "mp4",
  "avi",
  "mov",
  "wmv",
  "mkv",
  "flv",
  "mpeg",
  "webm",
  "ogv",
  "3gp",
  "3g2",
  "h264",
  "hevc",
  "divx",
  "xvid",
  "avchd",
];

export const ALLOWED_IMAGE_TYPES = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "tiff",
  "svg",
  "ico",
  "heif",
  "heic",
];

export type FileState = {
  fileBlob: File;
  url: string;
  name?: string;
  uploaded?: boolean;
  failed?: boolean;
};
