import { wrap, type Remote } from "comlink";
import { ALLOWED_IMAGE_TYPES, FILE_FORM } from "@/constants/file.constants";
import {
  CLIENT_ENCODE_SKIPPED_FORMATS,
  IMAGE_ENCODE_TIMEOUT_MS,
  IMAGE_PRESETS,
  WEBP_EXTENSION,
  WEBP_MIME_TYPE,
} from "@/constants/image.constants";
import type { ImagePresetName } from "@/types/image.types";
import {
  getFileExtension,
  getFileNameWithoutExtension,
} from "@/utils/file-uploader.util";
import type { ImageEncoder } from "./image-encode.worker";

let encoder: Remote<ImageEncoder> | undefined;

const getEncoder = (): Remote<ImageEncoder> => {
  if (encoder) return encoder;

  const worker = new Worker(
    new URL("./image-encode.worker.ts", import.meta.url),
    { type: "module" },
  );
  worker.addEventListener("error", () => {
    worker.terminate();
    encoder = undefined;
  });

  encoder = wrap<ImageEncoder>(worker);
  return encoder;
};

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Image encoding timed out")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const canEncodeInBrowser = () =>
  typeof Worker !== "undefined" &&
  typeof OffscreenCanvas !== "undefined" &&
  typeof createImageBitmap !== "undefined";

const isEncodableImage = (file: Blob, extension: string) =>
  (file.type.startsWith("image/") || ALLOWED_IMAGE_TYPES.includes(extension)) &&
  !CLIENT_ENCODE_SKIPPED_FORMATS.has(extension) &&
  !CLIENT_ENCODE_SKIPPED_FORMATS.has(file.type);

export const encodeImageForUpload = async <T extends Blob>(
  file: T,
  preset: ImagePresetName,
): Promise<T | File> => {
  const namedFile = file instanceof File ? file : undefined;
  const extension = getFileExtension(namedFile);

  if (!canEncodeInBrowser() || !isEncodableImage(file, extension)) return file;

  try {
    const encoded = await withTimeout(
      getEncoder().encode({ file, ...IMAGE_PRESETS[preset] }),
      IMAGE_ENCODE_TIMEOUT_MS,
    );
    if (!encoded) return file;

    const baseName = getFileNameWithoutExtension(namedFile) || "image";
    return new File([encoded.blob], `${baseName}.${WEBP_EXTENSION}`, {
      type: WEBP_MIME_TYPE,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
};

export const createImageFormData = async (
  file: Blob | undefined,
  preset: ImagePresetName,
): Promise<FormData> => {
  const formData = new FormData();
  formData.append(
    FILE_FORM.FILE,
    file ? await encodeImageForUpload(file, preset) : "",
  );
  return formData;
};
