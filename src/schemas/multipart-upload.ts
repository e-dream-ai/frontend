import { DreamFileType } from "@/types/dream.types";

export type CreateMultipartUploadFormValues = {
  uuid?: string;
  name?: string;
  extension?: string;
  parts?: number;
  nsfw?: boolean;
};

export type CompletedPart = { ETag?: string; PartNumber?: number };

export type RefreshMultipartUploadUrlFormValues = {
  uuid?: string;
  extension?: string;
  uploadId?: string;
  part?: number;
  type: DreamFileType;
};

export type CompleteMultipartUploadFormValues = {
  uuid?: string;
  name?: string;
  extension?: string;
  parts?: Array<CompletedPart>;
  uploadId?: string;
  type: DreamFileType;
};

export type AbortMultipartUploadFormValues = {
  uuid?: string;
  extension?: string;
  uploadId?: string;
};
