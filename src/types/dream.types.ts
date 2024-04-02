import { User } from "./auth.types";

export enum DreamStatusType {
  NONE = "none",
  QUEUE = "queue",
  PROCESSING = "processing",
  FAILED = "failed",
  PROCESSED = "processed",
}

export type Dream = {
  id: number;
  name: string;
  activityLevel: number;
  thumbnail: string;
  updated_at: string;
  user: Omit<User, "token">;
  uuid: string;
  video: string;
  original_video?: string;
  processedVideoSize?: number;
  processedVideoFrames?: number;
  processedVideoFPS?: number;
  status: DreamStatusType;
  created_at: string;
};

export type PresignedPost = {
  url: string;
  uuid: string;
  fields: {
    [key: string]: string;
  };
};

export type PresignedPostRequest = {
  params?: PresignedPost;
  file?: File;
};

export type MultipartUpload = {
  urls?: Array<string>;
  dream: Dream;
  uploadId?: string;
};

export type RefresgMultipartUpload = {
  url?: string;
  dream: Dream;
  uploadId?: string;
};

export type MultipartUploadRequest = {
  presignedUrl: string;
  filePart: Blob;
  partNumber: number;
  totalParts: number;
};
