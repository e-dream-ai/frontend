import { PlaylistApiResponse } from "@/schemas/playlist.schema";
import { ApiResponse } from "@/types/api.types";
import { ItemOrder, SetItemOrder } from "@/types/dnd.types";
import { Playlist, PlaylistItem } from "@/types/playlist.types";

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
