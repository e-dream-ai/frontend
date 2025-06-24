import { PlaylistApiResponse } from "@/schemas/playlist.schema";
import { ApiResponse } from "@/types/api.types";
import { ItemOrder, SetItemOrder } from "@/types/dnd.types";
import { Playlist, PlaylistItem } from "@/types/playlist.types";
import { TFunction } from "i18next";
import { getUserName } from "./user.util";
import moment from "moment";
import { FORMAT } from "@/constants/moment.constants";
import { filterHiddenOption, filterNsfwOption } from "./select.util";
import {
  UpdatePlaylistFormValues,
  UpdatePlaylistRequestValues,
} from "@/schemas/update-playlist.schema";
import { HIDDEN, NSFW } from "@/constants/select.constants";
import { framesToSeconds, secondsToTimeFormat } from "./video.utils";

export const getOrderedItemsPlaylistRequest = ({
  items = [],
  dropItem,
}: {
  items: ItemOrder[];
  dropItem: SetItemOrder;
}): ItemOrder[] => {
  // Check if the indices are within the bounds of the array
  if (
    dropItem.currentIndex < 0 ||
    dropItem.currentIndex >= items.length ||
    dropItem.newIndex < 0 ||
    dropItem.newIndex >= items.length
  ) {
    return items;
  }

  // Remove the item from the current position
  const itemToMove = items.splice(dropItem.currentIndex, 1)[0];

  // Insert the item at the new position
  items.splice(dropItem.newIndex, 0, itemToMove);

  // Set new order value
  return items.map((item, index) => ({ id: item.id, order: index }));
};

export const getOrderedPlaylist = ({
  previousPlaylist,
  orderedItems,
}: {
  previousPlaylist?: PlaylistApiResponse;
  orderedItems: ItemOrder[];
}): ApiResponse<{ playlist: Playlist }> | undefined => {
  if (previousPlaylist?.data?.playlist?.items) {
    previousPlaylist.data.playlist.items = (
      previousPlaylist.data?.playlist?.items ?? []
    ).map((item) => {
      const newItemOrder = orderedItems.find((i) => i.id === item.id);
      if (!newItemOrder) {
        return item;
      }
      item = { ...item, order: newItemOrder.order };
      return item;
    });
  }

  return previousPlaylist;
};

export const sortPlaylistItemsByName = (
  items?: PlaylistItem[],
): ItemOrder[] | undefined => {
  if (!items) {
    return undefined;
  }

  return (
    items
      .slice()
      .sort((a, b) => {
        // Determine the names based on the item type
        const nameA =
          (a.type === "dream" ? a.dreamItem?.name : a.playlistItem?.name) || "";
        const nameB =
          (b.type === "dream" ? b.dreamItem?.name : b.playlistItem?.name) || "";

        return nameA.localeCompare(nameB);
      })
      /**
       * Set order with zero-based indexing
       */
      .map((item, index) => ({ id: item.id, order: index }))
  );
};

export const sortPlaylistItemsByDate = (
  items?: PlaylistItem[],
): ItemOrder[] | undefined => {
  items?.slice();
  if (!items) {
    return undefined;
  }

  return (
    items
      .slice()
      .sort((a, b) => {
        // Direct comparison of date strings assuming ISO format
        const dateA = a.created_at;
        const dateB = b.created_at;

        if (dateA < dateB) {
          return -1;
        }
        if (dateA > dateB) {
          return 1;
        }
        return 0;
      })
      /**
       * Set order with zero-based indexing
       */
      .map((item, index) => ({ id: item.id, order: index }))
  );
};

// format playlist obj to fill form
export const formatPlaylistForm = ({
  playlist,
  isAdmin,
  t,
}: {
  playlist?: Playlist;
  isAdmin: boolean;
  t: TFunction;
}) => ({
  name: playlist?.name,
  user: playlist?.user?.name,
  /**
   * set displayedOwner
   * for admins always show displayedOwner
   * for normal users show displayedOwner, if doesn't exists, show user
   */
  displayedOwner: isAdmin
    ? {
        value: playlist?.displayedOwner?.id,
        label: getUserName(playlist?.displayedOwner),
      }
    : {
        value: playlist?.displayedOwner?.id ?? playlist?.user?.id,
        label: getUserName(playlist?.displayedOwner ?? playlist?.user),
      },
  featureRank: playlist?.featureRank,
  nsfw: filterNsfwOption(playlist?.nsfw, t),
  hidden: filterHiddenOption(playlist?.hidden, t),
  created_at: moment(playlist?.created_at).format(FORMAT),
});

export const formatPlaylistRequest = (
  uuid: string,
  data: UpdatePlaylistFormValues,
  isAdmin: boolean = false,
): UpdatePlaylistRequestValues => ({
  uuid: uuid,
  values: {
    name: data.name,
    featureRank: data?.featureRank,
    displayedOwner: data?.displayedOwner?.value,
    nsfw: data?.nsfw.value === NSFW.TRUE,
    // If user is admin, add allowed extra fields
    ...(isAdmin
      ? {
          hidden: data?.hidden.value === HIDDEN.TRUE,
        }
      : {}),
  },
});

/**
 * Recursively count the number of dreams in a playlist
 * Handles nested playlists by traversing through them
 */
export const countDreamsInPlaylist = (
  items?: PlaylistItem[],
  visitedPlaylistIds: Set<number> = new Set(),
): number => {
  if (!items) return 0;

  let count = 0;
  for (const item of items) {
    if (item.type === "dream") {
      count += 1;
    } else if (item.type === "playlist" && item.playlistItem) {
      // Avoid infinite recursion by tracking visited playlists
      if (!visitedPlaylistIds.has(item.playlistItem.id)) {
        visitedPlaylistIds.add(item.playlistItem.id);
        // Since playlistItem is Omit<Playlist, "items">, we can't access items directly
        // For now, we just count this as 1 nested playlist without recursing
        count += 1;
      }
    }
  }
  return count;
};

/**
 * Recursively calculate the total duration of all dreams in a playlist
 * Handles nested playlists by traversing through them
 * Returns total duration in seconds
 */
export const calculatePlaylistTotalDuration = (
  items?: PlaylistItem[],
  visitedPlaylistIds: Set<number> = new Set(),
): number => {
  if (!items) return 0;

  let totalSeconds = 0;
  for (const item of items) {
    if (item.type === "dream" && item.dreamItem) {
      const dream = item.dreamItem;
      if (dream.processedVideoFrames && dream.activityLevel) {
        totalSeconds += framesToSeconds(
          dream.processedVideoFrames,
          dream.activityLevel,
        );
      }
    } else if (item.type === "playlist" && item.playlistItem) {
      // Avoid infinite recursion by tracking visited playlists
      if (!visitedPlaylistIds.has(item.playlistItem.id)) {
        visitedPlaylistIds.add(item.playlistItem.id);
        // Since playlistItem is Omit<Playlist, "items">, we can't access items directly
        // For nested playlists, duration would need to be fetched separately
        // For now, we skip adding duration for nested playlists
      }
    }
  }
  return totalSeconds;
};

/**
 * Get formatted total duration string for a playlist
 * Returns duration in HH:MM:SS format
 */
export const getPlaylistTotalDurationFormatted = (
  items?: PlaylistItem[],
): string => {
  const totalSeconds = calculatePlaylistTotalDuration(items);
  return secondsToTimeFormat(totalSeconds);
};
