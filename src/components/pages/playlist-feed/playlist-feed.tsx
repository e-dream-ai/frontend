import { Column, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { ItemCard, ItemCardList } from "@/components/shared";
import { Paginate } from "@/components/shared/paginate/paginate";
import { Section } from "@/components/shared/section/section";
import { Spinner } from "@/components/shared/spinner/spinner";
import { PAGINATION } from "@/constants/pagination.constants";
import { useTranslation } from "react-i18next";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";
import { useState } from "react";
import { FeedItem } from "@/types/feed.types";
import Text from "@/components/shared/text/text";
import { useRankedFeed } from "@/api/feed/query/useRankedFeed";
import { ItemType } from "@/components/shared/item-card/item-card";
import { usePaginateProps } from "@/hooks/usePaginateProps";

const SECTION_ID = "ranked";

export const PlaylistsFeedPage: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(0);
  const {
    marginPagesDisplayed,
    pageRangeDisplayed,
    breakLabel,
    previousLabel,
    nextLabel,
    renderOnZeroPageCount
  } = usePaginateProps();

  const {
    data: feedData,
    isLoading: isFeedLoading,
    isRefetching: isFeedRefetching,
  } = useRankedFeed({
    page,
  });

  const feed = feedData?.data?.feed;
  const pageCount = Math.ceil((feedData?.data?.count ?? 1) / PAGINATION.TAKE);

  const isLoading = isFeedLoading || isFeedRefetching;

  const handleOnPageChange = ({ selected }: { selected: number }) => {
    setPage(selected);
  };

  return (
    <Container>
      <Section id={SECTION_ID}>
        <h2>{t("page.playlists.title")}</h2>

        <Column flex="auto">
          {isLoading ? (
            <Row justifyContent="center">
              <Spinner />
            </Row>
          ) : (
            <FeedList feed={feed} />
          )}
        </Column>

        <Row justifyContent="center" margin="0">
          <Paginate
            breakLabel={breakLabel}
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            marginPagesDisplayed={marginPagesDisplayed}
            pageRangeDisplayed={pageRangeDisplayed}
            renderOnZeroPageCount={renderOnZeroPageCount}
            forcePage={page}
            onPageChange={handleOnPageChange}
            pageCount={pageCount}
          />
        </Row>
      </Section>
    </Container>
  );
};

const FeedList: React.FC<{ feed?: FeedItem[] }> = ({ feed }) => {
  const { t } = useTranslation();
  return (
    <>
      <Row separator pb="1rem" mb="1rem">
        {t("page.playlists.feed")}
      </Row>
      {feed?.length ? (
        <ItemCardList grid columns={3}>
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
                showPlayButton
                key={feedItem.id}
                type={feedItem.type as ItemType}
                item={item}
                size="lg"
              />
            );
          })}
        </ItemCardList>
      ) : (
        <Text mb={4}>{t("page.playlists.empty_feed")}</Text>
      )}
    </>
  );
};

export default PlaylistsFeedPage;
