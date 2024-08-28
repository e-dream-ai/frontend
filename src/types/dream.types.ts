import { User } from "./auth.types";
import { PlaylistItem } from "./playlist.types";

export enum DreamStatusType {
  NONE = "none",
  QUEUE = "queue",
  PROCESSING = "processing",
  FAILED = "failed",
  PROCESSED = "processed",
}

export enum DreamFileType {
  DREAM = "dream",
  THUMBNAIL = "thumbnail",
  FILMSTRIP = "filmstrip",
}

export type Dream = {
  id: number;
  name: string;
  activityLevel: number;
  featureRank: number;
  thumbnail: string;
  displayedOwner: Omit<User, "token">;
  user: Omit<User, "token">;
  uuid: string;
  video: string;
  original_video?: string;
  processedVideoSize?: number;
  processedVideoFrames?: number;
  processedVideoFPS?: number;
  status: DreamStatusType;
  nsfw?: boolean;
  playlistItems?: PlaylistItem[];
  filmstrip?: Frame[];
  upvotes?: number;
  downvotes?: number;
  processed_at?: string;
  created_at: string;
  updated_at: string;
};

export type Frame = {
  frameNumber: number;
  url: string;
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

export type RefreshMultipartUpload = {
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
