export const IMAGE_COUNT_OPTIONS = [1, 4, 8, 12, 16, 24] as const;

export const parseSize = (
  size: string,
): { width: number; height: number } | null => {
  const match = size.match(/^\s*(\d+)\s*[x×*]\s*(\d+)\s*$/i);
  if (!match) {
    return null;
  }
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (width <= 0 || height <= 0) {
    return null;
  }
  return { width, height };
};

export const formatSizeLabel = (size: string): string => size.replace("*", "x");

export const clampSizeToAllowed = (
  currentSize: string,
  sizes: readonly string[],
): string => {
  if (sizes.length === 0) {
    return currentSize;
  }
  return sizes.includes(currentSize) ? currentSize : sizes[0];
};
