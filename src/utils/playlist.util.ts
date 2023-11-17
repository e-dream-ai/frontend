import { PlaylistApiResponse } from "schemas/playlist.schema";
import { ApiResponse } from "types/api.types";
import { OrderedItem } from "types/dnd.types";
import { Playlist, PlaylistItem } from "types/playlist.types";

export const getOrderedItemsPlaylistRequest = ({
  items = [],
  orderedItems,
}: {
  items: PlaylistItem[];
  orderedItems: OrderedItem[];
}): OrderedItem[] => {
  const requestPayload: OrderedItem[] = [];
  items.forEach((item) => {
    const orderedItem = orderedItems.find((oi) => oi?.id === item.id);

    if (orderedItem) {
      requestPayload.push({
        id: item.id,
        order: orderedItem.order,
      } as OrderedItem);
      return;
    }

    requestPayload.push({
      id: item.id,
      order: item.order,
    } as OrderedItem);
  });

  return requestPayload;
};

export const getOrderedPlaylist = ({
  previousPlaylist,
  orderedItems,
}: {
  previousPlaylist?: PlaylistApiResponse;
  orderedItems: OrderedItem[];
}): ApiResponse<{ playlist: Playlist }> | undefined => {
  if (previousPlaylist?.data?.playlist?.items) {
    previousPlaylist.data.playlist.items = [
      ...(previousPlaylist.data?.playlist?.items ?? []).map((item) => {
        const newOrderItem = orderedItems.find((i) => i.id === item.id);

        if (!newOrderItem) return item;

        if (item.id === newOrderItem.id)
          item = { ...item, order: newOrderItem.order };

        return item;
      }),
    ];
  }

  return previousPlaylist;
};
