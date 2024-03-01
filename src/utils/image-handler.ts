type ResizeMode = "cover" | "contain" | "fill" | "inside" | "outside";

type ResizeOptions = {
  width?: number;
  height?: number;
  fit: ResizeMode;
};

type ImageData = {
  bucket: string;
  key: string;
  edits?: { resize?: ResizeOptions };
};

export const BUCKET_NAME = import.meta.env.VITE_BUCKET_NAME;
export const BUCKET_URL = import.meta.env.VITE_BUCKET_URL;
export const IMAGE_HANDLER_BACKEND_URL = import.meta.env
  .VITE_IMAGE_HANDLER_BACKEND_URL;

export const generateImageURL = (
  objectKey?: string,
  resizeOptions?: ResizeOptions,
) => {
  if (!objectKey) {
    return undefined;
  }

  const data: ImageData = {
    key: objectKey!,
    bucket: BUCKET_NAME,
    edits: { resize: resizeOptions },
  };
  const encoded = btoa(JSON.stringify(data));
  return `${IMAGE_HANDLER_BACKEND_URL}/${encoded}`;
};

export const generateImageURLFromResource = (
  url?: string,
  resizeOptions?: ResizeOptions,
) => {
  if (!url) {
    return undefined;
  }

  const objectKey = url!.replace(`${BUCKET_URL}/`, "");
  const generatedUrl = generateImageURL(objectKey, resizeOptions);
  return `${generatedUrl}?v=${new Date().getTime()}`;
};
