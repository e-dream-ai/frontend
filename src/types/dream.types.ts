import { User } from "./auth.types";
import { Keyframe } from "./keyframe.types";
import { PlaylistItem } from "./playlist.types";
import { Report } from "./report.types";

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

export enum DreamMediaType {
  VIDEO = "video",
  IMAGE = "image",
}

export type Dream = {
  id: number;
  uuid: string;
  name: string;
  activityLevel: number;
  featureRank: number;
  thumbnail: string;
  displayedOwner: Omit<User, "token">;
  user: Omit<User, "token">;
  video: string;
  original_video?: string;
  processedVideoSize?: number;
  processedVideoFrames?: number;
  processedVideoFPS?: number;
  processedMediaWidth?: number;
  processedMediaHeight?: number;
  status: DreamStatusType;
  mediaType?: DreamMediaType;
  nsfw?: boolean;
  hidden?: boolean;
  description?: string;
  error?: string;
  prompt?: string | Record<string, unknown> | null;
  sourceUrl?: string;
  ccbyLicense?: boolean;
  playlistItems?: PlaylistItem[];
  filmstrip?: Frame[];
  upvotes?: number;
  downvotes?: number;
  startKeyframe?: Keyframe;
  endKeyframe?: Keyframe;
  reports?: Report[];
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
