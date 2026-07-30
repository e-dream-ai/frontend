import { cropRegionToPixels, type CropRegion } from "./aspect-crop";

/**
 * Browser-only helpers that turn a source image URL + a normalized crop region
 * into a cropped JPEG File, ready to upload as an image Dream. The pure crop
 * geometry lives in `aspect-crop.ts` (unit tested); this module is the thin
 * canvas/DOM shell around it.
 */

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    // Needed so the canvas isn't tainted when the image is served from the CDN.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error(`Failed to load image for cropping: ${url}`));
    img.src = url;
  });

/** Read a source image's natural pixel dimensions. */
export const loadImageDimensions = async (
  url: string,
): Promise<{ width: number; height: number }> => {
  const img = await loadImage(url);
  return { width: img.naturalWidth, height: img.naturalHeight };
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Canvas toBlob returned null")),
      type,
      quality,
    );
  });

/**
 * Crop `imageUrl` to `region` and return a JPEG File named `fileName`.
 * Throws if the image can't be loaded or the canvas is tainted (CORS).
 */
export const cropImageToFile = async (
  imageUrl: string,
  region: CropRegion,
  fileName: string,
): Promise<File> => {
  const img = await loadImage(imageUrl);
  const { sx, sy, sw, sh } = cropRegionToPixels(
    region,
    img.naturalWidth,
    img.naturalHeight,
  );

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, sw);
  canvas.height = Math.max(1, sh);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  const blob = await canvasToBlob(canvas, "image/jpeg", 0.95);
  const safeName = fileName.replace(/\.[^.]+$/, "");
  return new File([blob], `${safeName}.jpg`, { type: "image/jpeg" });
};
