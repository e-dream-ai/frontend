import { Dream } from "@/types/dream.types";
import { Playlist, PlaylistItem } from "@/types/playlist.types";

type NavigationResult = {
  next: PlaylistItem | null;
  previous: PlaylistItem | null;
};

export const getPlaylistNavigation = (
  currentDream?: Dream,
  playlist?: Playlist,
): NavigationResult => {
  // ensure we have items to work with
  const items = playlist?.items || [];

  console.log({ items });

  if (!items.length || !currentDream) {
    return { next: null, previous: null };
  }

  // find the current item index
  const currentIndex = items.findIndex(
    (item) => item.type === "dream" && item.dreamItem?.id === currentDream.id,
  );

  // if dream not found in playlist
  if (currentIndex === -1) {
    return { next: null, previous: null };
  }

  // get next and previous indices
  const nextIndex = currentIndex + 1;
  const previousIndex = currentIndex - 1;

  // get next and previous items
  const next = nextIndex < items.length ? items[nextIndex] : null;
  const previous = previousIndex >= 0 ? items[previousIndex] : null;

  return { next, previous };
};

// get next item from navigation
export const getNextItem = (
  currentDream: Dream,
  playlist: Playlist,
): PlaylistItem | null => {
  return getPlaylistNavigation(currentDream, playlist).next;
};

// get previous item from navigation
export const getPreviousItem = (
  currentDream: Dream,
  playlist: Playlist,
): PlaylistItem | null => {
  return getPlaylistNavigation(currentDream, playlist).previous;
};
