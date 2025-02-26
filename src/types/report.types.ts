import { User } from "./auth.types";
import { Dream } from "./dream.types";

export type Report = {
  id: number;
  uuid: string;
  dream: Dream;
  reportedBy?: User;
  processed: string;
  comments: string;
  link: string;
  processedBy?: User;
  reportedAt: string;
  processedAt: string;
  created_at: string;
  updated_at: string;
};
