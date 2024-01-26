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
  status: DreamStatusType;
  created_at: string;
};

export type PresignedPost = {
  url: string;
  fields: {
    [key: string]: string;
  };
};
