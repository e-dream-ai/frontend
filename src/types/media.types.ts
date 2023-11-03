export type MediaState =
  | {
      fileBlob: Blob;
      url: string;
    }
  | undefined;
