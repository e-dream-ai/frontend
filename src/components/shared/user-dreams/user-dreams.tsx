import { useMemo } from "react";
import { useFeed } from "@/api/feed/query/useFeed";
import { Column, ItemCard, ItemCardList, Row } from "@/components/shared";
import { Spinner } from "@/components/shared/spinner/spinner";
import Text from "@/components/shared/text/text";
import { useTranslation } from "react-i18next";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";
import { FeedItemFilterType } from "@/types/feed.types";
import { ItemType } from "../item-card/item-card";
import InfiniteScroll from "react-infinite-scroll-component";

type UserDreamsProps = {
  userUUID?: string;
  grid?: boolean;
  columns?: number;
  type?: FeedItemFilterType;
};

const Loader: React.FC = () => (
  <Row justifyContent="center" mt="2rem">
    <Spinner />
  </Row>
);

const UserDreams: React.FC<UserDreamsProps> = ({
  userUUID,
  grid,
  columns = 2,
  type
}) => {
  const { t } = useTranslation();

  const {
    data: feedData,
    isLoading: isFeedLoading,
    isRefetching: isFeedRefetching,
    fetchNextPage: fetchNextFeedPage,
    hasNextPage: hasNextFeedPage,
  } = useFeed({
    userUUID,
    type
  });

  const feed = useMemo(() => feedData?.pages.flatMap(page => page.data?.feed ?? []) ?? [], [feedData]);
  const feedDataLength = feedData?.pages.flatMap(page => page.data?.feed).length || 0;

  return (
    <Row flex="auto">
      <Column flex="auto">
        {isFeedLoading || isFeedRefetching ? (
          <Loader />
        ) : feed?.length ? (
          <InfiniteScroll
            dataLength={feedDataLength}
            next={fetchNextFeedPage}
            hasMore={hasNextFeedPage ?? false}
            loader={<Loader />}
            endMessage={
              !isFeedLoading &&
              <Row justifyContent="center" mt="2rem">
                <Text>{t("components.infinite_scroll.end_message")}</Text>
              </Row>
            }
          >
            <ItemCardList grid={grid} columns={columns}>
              {feed?.map((feedItem) => {
                let item;
                if (feedItem.type === "dream") {
                  item = {
                    ...feedItem.dreamItem,
                    user: feedItem.user,
                  } as Dream;
                } else if (feedItem.type === "playlist") {
                  item = {
                    ...feedItem.playlistItem,
                    user: feedItem.user,
                  } as Playlist;
                }
                return (
                  <ItemCard
                    type={feedItem.type as ItemType}
                    item={item}
                    key={feedItem.id}
                    size="lg"
                    showPlayButton
                  />
                );
              })}
            </ItemCardList>
          </InfiniteScroll>
        ) : (
          <Text>{t("components.my_dreams.empty")}</Text>
        )}
      </Column>
    </Row>
  );
};

export default UserDreams;
