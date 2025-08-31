import { ResizeOptions } from "@/types/image.types";

const CLOUDFLARE_DOMAIN = import.meta.env.VITE_BUCKET_URL;
const DEFAULT_FORMAT = "auto";

function normalizeUrl(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

function buildTransformParams(options: ResizeOptions): string[] {
  const params: string[] = [];

  if (options.width) params.push(`width=${options.width}`);
  if (options.height) params.push(`height=${options.height}`);
  if (options.fit) params.push(`fit=${options.fit}`);

  params.push(`format=${DEFAULT_FORMAT}`);

  return params;
}

export function generateCloudflareImageURL(
  imageUrl: string,
  resizeOptions?: ResizeOptions,
): string | undefined {
  if (!imageUrl) return undefined;

  // Normalize the input URL to remove protocol
  const cleanUrl = normalizeUrl(imageUrl);

  if (!resizeOptions) {
    return `https://${cleanUrl}`;
  }

  const normalizedDomain = normalizeUrl(CLOUDFLARE_DOMAIN || "");

  const imagePath = cleanUrl.replace(`${normalizedDomain}/`, "");

  const params = buildTransformParams(resizeOptions);

  return `https://${normalizedDomain}/cdn-cgi/image/${params.join(
    ",",
  )}/${imagePath}`;
}
