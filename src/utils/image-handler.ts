import { ResizeOptions } from "@/types/image.types";

const WORKER_URL = import.meta.env.VITE_WORKER_URL;
const DEFAULT_FORMAT = "auto";
const DEFAULT_QUALITY = 100;
const DEFAULT_FIT = "cover";

function buildWorkerParams(
  imageUrl: string,
  options: ResizeOptions,
): URLSearchParams {
  const params = new URLSearchParams();

  params.set("url", imageUrl);

  if (options.width) params.set("w", options.width.toString());
  if (options.height) params.set("h", options.height.toString());
  params.set("fit", options.fit || DEFAULT_FIT);
  params.set("format", options.format || DEFAULT_FORMAT);
  params.set("q", (options.quality || DEFAULT_QUALITY).toString());

  return params;
}

export function generateCloudflareImageURL(
  imageUrl: string,
  resizeOptions?: ResizeOptions,
): string | undefined {
  if (!imageUrl) return undefined;
  if (!WORKER_URL) return imageUrl;

  if (!resizeOptions) {
    return imageUrl;
  }

  const params = buildWorkerParams(imageUrl, resizeOptions);
  return `${WORKER_URL}?${params.toString()}`;
}
