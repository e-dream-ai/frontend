import { PlaylistApiResponse } from "schemas/playlist.schema";
import { ApiResponse } from "types/api.types";
import { ItemOrder, SetItemOrder } from "types/dnd.types";
import { Playlist } from "types/playlist.types";

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
