import { expose } from "comlink";
import { WEBP_MIME_TYPE } from "@/constants/image.constants";
import type { ImagePreset } from "@/types/image.types";

export type EncodeImageRequest = ImagePreset & { file: Blob };

export type EncodedImage = {
  blob: Blob;
  width: number;
  height: number;
};

type WebpEncoder = typeof import("@jsquash/webp/encode").default;

let webpEncoder: Promise<WebpEncoder> | undefined;
let nativeWebpSupport: Promise<boolean> | undefined;
let queue: Promise<unknown> = Promise.resolve();

const loadWebpEncoder = () =>
  (webpEncoder ??= import("@jsquash/webp/encode").then(
    (module) => module.default,
  ));

const supportsNativeWebp = () =>
  (nativeWebpSupport ??= new OffscreenCanvas(1, 1)
    .convertToBlob({ type: WEBP_MIME_TYPE })
    .then((blob) => blob.type === WEBP_MIME_TYPE)
    .catch(() => false));

const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
  const run = queue.then(task);
  queue = run.catch(() => undefined);
  return run;
};

const fitInside = (width: number, height: number, maxDimension: number) => {
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

const encodeWebp = async (
  canvas: OffscreenCanvas,
  context: OffscreenCanvasRenderingContext2D,
  quality: number,
): Promise<Blob> => {
  if (await supportsNativeWebp()) {
    return canvas.convertToBlob({
      type: WEBP_MIME_TYPE,
      quality: quality / 100,
    });
  }

  const encode = await loadWebpEncoder();
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  return new Blob([await encode(imageData, { quality })], {
    type: WEBP_MIME_TYPE,
  });
};

const encodeImage = async ({
  file,
  maxDimension,
  quality,
}: EncodeImageRequest): Promise<EncodedImage | null> => {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  try {
    const fitsPreset = Math.max(bitmap.width, bitmap.height) <= maxDimension;
    if (fitsPreset && file.type === WEBP_MIME_TYPE) return null;

    const { width, height } = fitInside(
      bitmap.width,
      bitmap.height,
      maxDimension,
    );
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("2D canvas context unavailable");

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, width, height);

    return { blob: await encodeWebp(canvas, context, quality), width, height };
  } finally {
    bitmap.close();
  }
};

const imageEncoder = {
  encode: (request: EncodeImageRequest) => enqueue(() => encodeImage(request)),
};

export type ImageEncoder = typeof imageEncoder;

expose(imageEncoder);
