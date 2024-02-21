export type CreateMultipartUploadFormValues = {
  name?: string;
  extension?: string;
  parts?: number;
};

export type CompleteMultipartUploadFormValues = {
  uuid?: string;
  name?: string;
  extension?: string;
  parts?: number;
  uploadId?: string;
};
