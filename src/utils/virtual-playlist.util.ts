/**
 * Util file to manage virtual playlists on feed
 * Virtual playlists are generated on frontend to group dreams that belongs to same playlist
 * It helps to have a cleaner feed for the users
 */

import { Dream } from "@/types/dream.types";

/*
 * Filters displayed dreams for virtual playlists:
 * - 4 dreams -> 1 multicard
 * - 5 dreams -> 1 dream + 1 multicard
 * - 6 dreams -> 2 dreams + 1 multicard
 * - 7 dreams -> 3 dreams + 1 multicard
 * - 8+ dreams -> 3 dreams + 1 multicard (and shows "...")
 */
export const getVirtualPlaylistDisplayedDreams = (dreams: Dream[]): Dream[] =>
  dreams.slice(0, Math.min(dreams.length - 4, 3));

/*
 * Filters thumbnail dreams for virtual playlists:
 * 4: 1 multicard (1-4)
 * 5: 1 dream shown, thumbnail uses 3,4,5,6
 * 6: 2 dreams shown, thumbnail uses 4,5,6,7
 * 7-8: 3 dreams shown, thumbnail uses 5,6,7,8
 */
export const getVirtualPlaylistThumbnailDreams = (
  dreams: Dream[] = [],
): Dream[] => {
  const len = dreams.length;

  // For arrays with 4 or fewer elements, return all
  if (len <= 4) return dreams;

  // Special case for 5 elements
  if (len === 5) return dreams.slice(1, 5); // [2,3,4,5]

  // Calculate start index for arrays with 6+ elements
  const start = len >= 8 ? 3 : len - 4;

  // Return 4 elements starting from calculated index
  return dreams.slice(start, start + 4);
};

export const shouldVirtualPlaylistDisplayDots = (dreams: Dream[]): boolean =>
  dreams.length > 8;
