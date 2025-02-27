import { User } from "./auth.types";
import { Dream } from "./dream.types";

export type ReportType = {
  id: number;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Report = {
  id: number;
  uuid: string;
  type: ReportType;
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
