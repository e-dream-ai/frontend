import { Column, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import Text from "@/components/shared/text/text";
import { useRankedFeed } from "@/api/feed/query/useRankedFeed";
import InfiniteScroll from "react-infinite-scroll-component";
import { Loader } from "@/components/shared/loader/loader";
import { FeedList } from "../feed/feed-list";
import { useTheme } from "styled-components";
import SearchBar from "@/components/shared/search-bar/search-bar";
import { useDebounce } from "@/hooks/useDebounce";

const SECTION_ID = "ranked";

export const PlaylistsFeedPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState<string | undefined>();
  const [search, setSearch] = useState<string | undefined>();
  const debouncedSearch = useDebounce(searchValue, 500);

  const {
    data: feedData,
    isLoading: isFeedLoading,
    isRefetching: isFeedRefetching,
    fetchNextPage: fetchNextFeedPage,
    hasNextPage: hasNextFeedPage,
  } = useRankedFeed({ search });

  const feed = useMemo(
    () => feedData?.pages.flatMap((page) => page.data?.feed ?? []) ?? [],
    [feedData],
  );
  const feedDataLength =
    feedData?.pages.flatMap((page) => page.data?.feed).length || 0;
  const isLoading = isFeedLoading || isFeedRefetching;

  const handleOnChange = (value?: string) => {
    if (!value && value !== "") return;
    setSearchValue(value);
  };

  const handleOnSearch = (value?: string) => {
    if (!value && value !== "") return;
    setSearch(value);
  };

  const handleOnClearSearch = () => {
    setSearchValue("");
  };

  // Update search state only after debounce
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <Container>
      <Section id={SECTION_ID}>
        <Row
          justifyContent="space-between"
          alignItems="center"
          style={{ gap: "12px" }}
        >
          <h2 style={{ margin: 0 }}>{t("page.playlists.title")}</h2>
          <SearchBar
            showClearButton={Boolean(searchValue)}
            onChange={handleOnChange}
            onSearch={handleOnSearch}
            onClear={handleOnClearSearch}
          />
        </Row>

        <Column flex="auto" mt="1rem">
          <InfiniteScroll
            dataLength={feedDataLength}
            next={fetchNextFeedPage}
            hasMore={hasNextFeedPage ?? false}
            loader={<Loader />}
            endMessage={
              !isLoading && (
                <Row justifyContent="center" mt="2rem">
                  <Text color={theme.textPrimaryColor}>
                    {t("components.infinite_scroll.end_message")}
                  </Text>
                </Row>
              )
            }
          >
            {isLoading ? (
              <Loader />
            ) : (
              <FeedList showTitle={false} feed={feed} virtualPlaylists={[]} />
            )}
          </InfiniteScroll>
        </Column>
      </Section>
    </Container>
  );
};

export default PlaylistsFeedPage;
