export type CreateMultipartUploadFormValues = {
  uuid?: string;
  name?: string;
  extension?: string;
  parts?: number;
};

export type CompletedPart = { ETag?: string; PartNumber?: number };

export type CompleteMultipartUploadFormValues = {
  uuid?: string;
  name?: string;
  extension?: string;
  parts?: Array<CompletedPart>;
  uploadId?: string;
};
