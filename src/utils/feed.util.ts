import { Dream } from "@/types/dream.types";
import { FeedItem, VirtualPlaylist } from "@/types/feed.types";

/**
 * Groups feed dreams by playlist, avoiding duplicates for dreams in multiple playlists
 * @param feedItems Array of feed items containing dreams and playlists
 * @returns Map of playlist UUIDs data with associated dreams
 */
export const groupFeedDreamItemsByPlaylist = (
  feedItems: FeedItem[] = [],
): Map<string, VirtualPlaylist> => {
  // Initialize map to store playlist UUID → playlist data with dreams
  const playlistsMap = new Map<string, VirtualPlaylist>();
  // Track which dreams have been assigned to virtual playlists to avoid duplicates
  const assignedDreams = new Set<string>();

  // First pass: collect all playlists and their potential dreams
  const playlistCandidates = new Map<
    string,
    {
      playlist: VirtualPlaylist;
      dreams: Dream[];
    }
  >();

  feedItems.forEach((item) => {
    const dream: Dream | undefined = item?.dreamItem;

    if (dream && dream.playlistItems) {
      dream.playlistItems.forEach((playlistItem) => {
        const dreamPlaylist = playlistItem.playlist;

        if (!dreamPlaylist) {
          return;
        }

        const playlistUUID = dreamPlaylist.uuid;
        let candidate = playlistCandidates.get(playlistUUID);

        if (!candidate) {
          candidate = {
            playlist: {
              id: dreamPlaylist.id,
              uuid: playlistUUID,
              name: dreamPlaylist.name || playlistUUID,
              user: item.user,
              displayedOwner: item.user,
              dreams: [],
              created_at: item.created_at,
            },
            dreams: [],
          };
          playlistCandidates.set(playlistUUID, candidate);
        }

        // Take user from the item and add it to the dream to show it in the card
        const dreamWithUser = { ...dream, user: item.user };
        candidate.dreams.push(dreamWithUser);
      });
    }
  });

  // Second pass: assign dreams to playlists, prioritizing playlists with more dreams
  // Sort playlists by dream count (descending) to prioritize fuller playlists
  const sortedCandidates = Array.from(playlistCandidates.entries()).sort(
    ([, a], [, b]) => b.dreams.length - a.dreams.length,
  );

  sortedCandidates.forEach(([playlistUUID, candidate]) => {
    // Only include dreams that haven't been assigned to other virtual playlists
    const availableDreams = candidate.dreams.filter(
      (dream) => !assignedDreams.has(dream.uuid),
    );

    // Only create virtual playlist if we have 4+ available dreams
    if (availableDreams.length >= 4) {
      // Sort dreams by creation date (newest first) to show most recent dreams
      availableDreams.sort((a, b) => b.created_at.localeCompare(a.created_at));

      // Update the playlist's created_at to match the newest dream for proper sorting
      candidate.playlist.created_at =
        availableDreams[0]?.created_at || candidate.playlist.created_at;
      candidate.playlist.dreams = availableDreams;
      playlistsMap.set(playlistUUID, candidate.playlist);

      // Mark these dreams as assigned
      availableDreams.forEach((dream) => {
        assignedDreams.add(dream.uuid);
      });
    }
  });

  return playlistsMap;
};
