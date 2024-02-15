// MAX_FILE_SIZE_MB 16GB
export const MAX_FILE_SIZE_MB = 50 * 1024;

export const FILE_FORM = {
  FILE: "file",
};

export const ALLOWED_VIDEO_TYPES = [
  "MP4",
  "AVI",
  "MOV",
  "WMV",
  "MKV",
  "FLV",
  "MPEG",
  "WEBM",
  "OGV",
  "3GP",
  "3G2",
  "H264",
  "HEVC",
  "DIVX",
  "XVID",
  "AVCHD",
];

export type FileState = {
  fileBlob: File;
  url: string;
  name?: string;
  uploaded?: boolean;
  failed?: boolean;
};
