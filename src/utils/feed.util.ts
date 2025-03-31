import { Dream } from "@/types/dream.types";
import { FeedItem, VirtualPlaylist } from "@/types/feed.types";

/**
 * Groups feed dreams by playlist
 * @param feedItems Array of feed items containing dreams and playlists
 * @returns Map of playlist UUIDs data with associated dreams
 */
export const groupFeedDreamItemsByPlaylist = (
  feedItems: FeedItem[] = [],
): Map<string, VirtualPlaylist> => {
  // Initialize map to store playlist UUID → playlist data with dreams
  const playlistsMap = new Map<string, VirtualPlaylist>();

  // Associate dreams with playlists
  feedItems.forEach((item) => {
    // Only associate items with dreamItem data
    const dream: Dream | undefined = item?.dreamItem;

    if (dream && dream.playlistItems) {
      // Add dream to each playlist it belongs to
      dream.playlistItems.forEach((playlistItem) => {
        const dreamPlaylist = playlistItem.playlist;

        if (!dreamPlaylist) {
          return;
        }

        const playlistId = dreamPlaylist.id;
        const playlistUUID = dreamPlaylist.uuid;
        const playlistName = dreamPlaylist.name || dreamPlaylist.uuid;

        let playlist: VirtualPlaylist | undefined;

        // Look for the playlist by various possible keys
        playlist = playlistsMap.get(playlistUUID);

        // If playlist not found, create a new entry
        if (!playlist) {
          playlist = {
            id: playlistId,
            uuid: playlistUUID,
            name: playlistName,
            user: item.user,
            displayedOwner: item.user,
            dreams: [],
            created_at: item.created_at,
          };
          playlistsMap.set(playlistUUID, playlist);
        }

        // Take user from the item and add it to the dream to show it in the card
        dream.user = item.user;
        // Add dream to this playlist
        playlist.dreams.push(dream);
      });
    }
  });

  // Filter to have playlists with 4 dreams or more only
  const playlists = new Map(
    [...playlistsMap].filter(([, playlist]) => playlist.dreams.length >= 4),
  );

  return playlists;
};
