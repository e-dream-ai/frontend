export type ResizeMode = "cover" | "contain" | "fill" | "inside" | "outside";

export type ResizeOptions = {
  width?: number;
  height?: number;
  fit: ResizeMode;
};

export type ImageData = {
  bucket: string;
  key: string;
  edits?: { resize?: ResizeOptions };
};
