import { Column, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import Text from "@/components/shared/text/text";
import { useRankedFeed } from "@/api/feed/query/useRankedFeed";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "@/components/shared/loader/loader";
import { FeedList } from "../feed/feed-list";
import { useTheme } from "styled-components";

const SECTION_ID = "ranked";

export const PlaylistsFeedPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    data: feedData,
    isLoading: isFeedLoading,
    isRefetching: isFeedRefetching,
    fetchNextPage: fetchNextFeedPage,
    hasNextPage: hasNextFeedPage,
  } = useRankedFeed();

  const feed = useMemo(() => feedData?.pages.flatMap(page => page.data?.feed ?? []) ?? [], [feedData]);
  const feedDataLength = feedData?.pages.flatMap(page => page.data?.feed).length || 0;
  const isLoading = isFeedLoading || isFeedRefetching;

  return (
    <Container>
      <Section id={SECTION_ID}>
        <h2>{t("page.playlists.title")}</h2>

        <Column flex="auto">
          <InfiniteScroll
            dataLength={feedDataLength}
            next={fetchNextFeedPage}
            hasMore={hasNextFeedPage ?? false}
            loader={<Loader />}
            endMessage={
              !isLoading &&
              <Row justifyContent="center" mt="2rem">
                <Text color={theme.textPrimaryColor}>{t("components.infinite_scroll.end_message")}</Text>
              </Row>
            }
          >
            {
              isLoading
                ? <Loader />
                : <FeedList
                  title={t("page.playlists.feed")}
                  feed={feed}
                  virtualPlaylists={[]}
                  dreamsInVirtualPlaylists={[]}
                />
            }
          </InfiniteScroll>
        </Column>
      </Section>
    </Container>
  );
};

export default PlaylistsFeedPage;
