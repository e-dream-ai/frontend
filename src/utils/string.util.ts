/**
 * Truncates a string based on character length
 * @param str - Input string
 * @param num - Max number of characters
 * @param ellipsis -If add ellipsis when truncated, default `true`
 * @returns Truncated string or undefined
 */
export const truncateString = (
  str?: string,
  num?: number,
  ellipsis: boolean = true,
): string | undefined => {
  if (!str) {
    return undefined;
  }

  if (str.length > (num ?? 0)) {
    // Add ellipsis if specified
    return str.slice(0, num) + (ellipsis ? "..." : "");
  } else {
    return str;
  }
};

/**
 * Truncates a string based on word count
 * @param str - Input string
 * @param num - Max number of characters
 * @param ellipsis -If add ellipsis when truncated, default `true`
 * @returns Truncated string or undefined
 */
export const truncateWords = (
  str?: string,
  num?: number,
  ellipsis: boolean = true,
): string | undefined => {
  if (!str) {
    return undefined;
  }

  const words = str.trim().split(/\s+/);

  if (words.length <= (num ?? 0)) {
    return str;
  }

  const truncatedWords = words.slice(0, num).join(" ");

  // Add ellipsis if specified
  return truncatedWords + (ellipsis ? "..." : "");
};

export const removeEmptyString = (value?: string) =>
  value?.trim() === "" ? undefined : value;
