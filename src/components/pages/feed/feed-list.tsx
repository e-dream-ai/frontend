import { FeedItem, PlaylistWithDreams } from "@/types/feed.types";
import { ItemCard, ItemCardList, Row, Text } from "@/components/shared";
import { useTranslation } from "react-i18next";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";
import { ItemType } from "@/components/shared/item-card/item-card";
import { getVirtualPlaylistDisplayedDreams } from "@/utils/virtual-playlist.util";
import { useMemo } from "react";

type FeedListProps = {
  feed?: FeedItem[];
  virtualPlaylists: PlaylistWithDreams[];
  dreamsInVirtualPlaylists: string[];
}

type ProcessedItem = {
  key: string | number;
  type: ItemType;
  item: Dream | Playlist;
  created_at: string;
}

export const FeedList: React.FC<FeedListProps> = ({ feed = [], virtualPlaylists, dreamsInVirtualPlaylists, }) => {
  const { t } = useTranslation();

  // Memoize the processing of feed items to improve performance
  const processedFeedItems = useMemo(() => {
    // Filter out dreams already in virtual playlists
    const filteredFeed = feed.filter(
      feedItem => !(
        feedItem.dreamItem &&
        dreamsInVirtualPlaylists.includes(feedItem.dreamItem.uuid)
      )
    );

    // Transform feed items into renderable items
    return filteredFeed.map(feedItem => {
      let item: Dream | Playlist;
      let type: ItemType;

      if (feedItem.type === "dream") {
        item = {
          ...feedItem.dreamItem,
          user: feedItem.user,
        } as Dream;
        type = "dream";
      } else if (feedItem.type === "playlist") {
        item = {
          ...feedItem.playlistItem,
          user: feedItem.user,
        } as Playlist;
        type = "playlist";
      } else {
        // Fallback for unexpected types
        return null;
      }

      const processedItem: ProcessedItem = {
        key: feedItem.id,
        type,
        item,
        created_at: feedItem.created_at
      }

      return processedItem;
    }).filter(Boolean) as ProcessedItem[];
  }, [feed, dreamsInVirtualPlaylists]);

  // Memoize virtual playlist dreams rendering
  const virtualPlaylistItems = useMemo(() => {
    return virtualPlaylists.flatMap(pl => {
      const dreamsToShow = getVirtualPlaylistDisplayedDreams(pl.dreams);
      const lastDreamToShow = dreamsToShow[dreamsToShow.length - 1];
      return [
        ...dreamsToShow.map(dream => ({
          // Set dream uuid as feed item key to use it on key for renderization
          key: `${pl.uuid}_${dream.uuid}`,
          type: "dream" as const,
          item: dream,
          // Need to take lastDreamToShow `created_at` value to render virtual playlist just after the dreams
          created_at: lastDreamToShow?.created_at ?? pl.created_at,
        } as ProcessedItem)),
        {
          // Set playlist uuid as feed item key to use it on key for renderization
          key: pl.uuid,
          type: "virtual-playlist" as const,
          item: pl,
          // Need to take lastDreamToShow `created_at` value to render virtual playlist just after the dreams
          created_at: lastDreamToShow?.created_at ?? pl.created_at
        }
      ];
    });
  }, [virtualPlaylists]);

  // Memoize the combination of all items
  const allItems = useMemo(() =>
    [...processedFeedItems, ...virtualPlaylistItems]
      // Need to sort by `created_at` since generating virtual playlist breaks the order feed order
      .sort((a, b) =>
        b.created_at.localeCompare(a.created_at)
      )
    , [processedFeedItems, virtualPlaylistItems]);

  // Render logic

  // Render empty feed
  if (allItems.length === 0) {
    return <Text mb={4}>{t("page.feed.empty_feed")}</Text>;
  }

  // Render empty items
  if (allItems.length === 0) {
    return (
      <>
        <Row separator pb="1rem" mb="1rem">
          {t("page.feed.feed")}
        </Row>
        <Text mb={4}>{t("page.feed.empty_feed")}</Text>;
      </>
    )
  }

  return (
    <>
      <Row separator pb="1rem" mb="1rem">
        {t("page.feed.feed")}
      </Row>
      <ItemCardList grid columns={3}>
        {allItems.map(itemData => (
          <ItemCard
            showPlayButton
            key={itemData.key}
            type={itemData.type as ItemType}
            item={itemData.item}
            size="lg"
          />
        ))}
      </ItemCardList>
    </>
  );
};