export type ResizeMode = "cover" | "contain" | "crop" | "scale-down" | "pad";

export type ResizeOptions = {
  width?: number;
  height?: number;
  fit?: ResizeMode;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
};

export type ImagePresetName = "dream" | "thumbnail" | "avatar";

export type ImagePreset = {
  maxDimension: number;
  quality: number;
};
