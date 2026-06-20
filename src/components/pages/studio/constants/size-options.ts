export const IMAGE_COUNT_OPTIONS = [1, 4, 8, 12, 16, 24] as const;

export const clampSizeToAllowed = (
  currentSize: string,
  sizes: readonly string[],
): string => {
  if (sizes.length === 0) {
    return currentSize;
  }
  return sizes.includes(currentSize) ? currentSize : sizes[0];
};
