import { ResizeOptions } from "@/types/image.types";

const DEFAULT_FORMAT = "webp";
const DEFAULT_QUALITY = 85;
const DEFAULT_FIT = "cover";

export function generateCloudflareImageURL(
  imageUrl: string,
  resizeOptions?: ResizeOptions,
): string | undefined {
  if (!imageUrl) return undefined;
  if (!resizeOptions) return imageUrl;

  const url = new URL(imageUrl);
  if (resizeOptions.width)
    url.searchParams.set("w", resizeOptions.width.toString());
  if (resizeOptions.height)
    url.searchParams.set("h", resizeOptions.height.toString());
  url.searchParams.set("fit", resizeOptions.fit || DEFAULT_FIT);
  url.searchParams.set("format", resizeOptions.format || DEFAULT_FORMAT);
  url.searchParams.set(
    "q",
    (resizeOptions.quality || DEFAULT_QUALITY).toString(),
  );
  return url.toString();
}
