export const truncateArray: <T>(
  array?: Array<T>,
  maxLength?: number,
) => Array<T> = (array, maxLength) => (array ?? []).slice(0, maxLength);
