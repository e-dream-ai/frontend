import type { ResizeOptions } from "@/types/image.types";
import { generateCloudflareImageURL } from "@/utils/image-handler";

/*
 * Sizes to ask the image worker for, about twice the largest width each is
 * drawn at so they stay sharp on high-density screens. Scale-down keeps the
 * shape and never enlarges a small original. Kept as constants: PresignedImage
 * memoizes on the object.
 */
/** Matrix row headings and the preview caption. */
export const ROW_THUMB: ResizeOptions = { width: 160, fit: "scale-down" };
/** Clip history, 126px wide. */
export const HISTORY_THUMB: ResizeOptions = { width: 256, fit: "scale-down" };
/** Image cards: the Images tab and the pickers. */
export const CARD_THUMB: ResizeOptions = { width: 480, fit: "scale-down" };
/** The matrix row dialog's preview. */
export const DIALOG_THUMB: ResizeOptions = { width: 1120, fit: "scale-down" };

/** Whether the image worker signed it, which is what lets it resize. */
const isWorkerSigned = (url: string) => {
  try {
    const { protocol, searchParams } = new URL(url);
    return protocol.startsWith("http") && searchParams.has("sig");
  } catch {
    return false;
  }
};

/**
 * `url` at the given size when the image worker serves it. Anything else — a
 * local blob preview, another host — comes back untouched.
 */
export const sizedImageUrl = (url: string, size: ResizeOptions) =>
  isWorkerSigned(url) ? generateCloudflareImageURL(url, size) ?? url : url;
