import { useGroupedFeed } from "@/api/feed/query/useGroupedFeed";
import { Column, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import RadioButtonGroup from "@/components/shared/radio-button-group/radio-button-group";
import SearchBar from "@/components/shared/search-bar/search-bar";
import { Section } from "@/components/shared/section/section";
import { useTranslation } from "react-i18next";
import { FEED_FILTERS, getFeedFilterData } from "@/constants/feed.constants";
import { useEffect, useMemo, useState } from "react";
import { FeedItemFilterType, FeedItemType } from "@/types/feed.types";
import { User } from "@/types/auth.types";
import Text from "@/components/shared/text/text";
import { ROLES } from "@/constants/role.constants";
import { RoleType } from "@/types/role.types";
import useAuth from "@/hooks/useAuth";
import { isAdmin } from "@/utils/user.util";
import InfiniteScroll from "react-infinite-scroll-component";
import { FeedList } from "./feed-list";
import { UserFeedList } from "./user-feed-list";
import { useInfiniteUsers } from "@/api/user/query/useInfiniteUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader } from "@/components/shared/loader/loader";
import { useTheme } from "styled-components";

const USER_TAKE = {
  SEARCH: 3,
  USER_FILTER: 10,
};

const SECTION_ID = "feed";

// Gets user role using `FEED_FILTERS` to fetch users by its type
const getUserFeedType: (type?: FeedItemType) => RoleType | undefined = (
  type,
) => {
  if (type === FEED_FILTERS.ALL) return undefined;
  if (type === FEED_FILTERS.DREAM) return undefined;
  if (type === FEED_FILTERS.PLAYLIST) return undefined;
  if (type === FEED_FILTERS.USER) return ROLES.USER_GROUP;
  if (type === FEED_FILTERS.CREATOR) return ROLES.CREATOR_GROUP;
  if (type === FEED_FILTERS.ADMIN) return ROLES.ADMIN_GROUP;
  return undefined;
};

const isFeedItemType = (value: string): value is FeedItemType => {
  return Object.values(FEED_FILTERS).includes(value as FeedItemType);
};

export const FeedPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const [searchValue, setSearchValue] = useState<string | undefined>();
  const [search, setSearch] = useState<string | undefined>();
  const [radioGroupState, setRadioGroupState] = useState<FeedItemType>(
    FEED_FILTERS.ALL,
  );

  /**
   * Debounce search value after keyboard press
   * Default - 500
   */
  const debouncedSearch = useDebounce(searchValue, 1000);

  const {
    data: feedData,
    isLoading: isFeedLoading,
    fetchNextPage: fetchNextFeedPage,
    hasNextPage: hasNextFeedPage,
    isFetchingNextPage,
  } = useGroupedFeed({
    search,
    type: radioGroupState as FeedItemFilterType,
  });

  // Extract feed items and virtual playlists from the grouped feed response
  const { feedItems, virtualPlaylists } = useMemo(() => {
    const allFeedItems =
      feedData?.pages.flatMap((page) => page.data?.feedItems ?? []) ?? [];
    const allVirtualPlaylists =
      feedData?.pages.flatMap((page) => page.data?.virtualPlaylists ?? []) ??
      [];

    // Only use virtual playlists when showing all items (not filtered)
    const shouldUseVirtualPlaylists = radioGroupState === FEED_FILTERS.ALL;

    return {
      feedItems: allFeedItems,
      virtualPlaylists: shouldUseVirtualPlaylists ? allVirtualPlaylists : [],
    };
  }, [feedData, radioGroupState]);

  const feedDataLength = useMemo(
    () => feedItems.length + virtualPlaylists.length,
    [feedItems, virtualPlaylists],
  );

  const {
    data: usersData,
    isLoading: isUsersLoading,
    fetchNextPage: fetchNextUsersPage,
    hasNextPage: hasNextUsersPage,
  } = useInfiniteUsers({
    search,
    take:
      radioGroupState === FEED_FILTERS.USER
        ? USER_TAKE.USER_FILTER
        : USER_TAKE.SEARCH,
    role: getUserFeedType(radioGroupState),
  });

  const users = useMemo(
    () => usersData?.pages.flatMap((page) => page.data?.users ?? []) ?? [],
    [usersData],
  );
  const usersDataLength = useMemo(() => users.length, [users]);

  const showUserList = useMemo(
    () =>
      [FEED_FILTERS.USER, FEED_FILTERS.CREATOR, FEED_FILTERS.ADMIN].includes(
        radioGroupState,
      ),
    [radioGroupState],
  );

  const handleRadioButtonGroupChange = (value?: string) => {
    if (value && isFeedItemType(value)) {
      setRadioGroupState(value);
    }
  };

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
        <h2>{t("page.feed.title")}</h2>

        <Column flex="auto">
          <SearchBar
            showClearButton={Boolean(searchValue)}
            onChange={handleOnChange}
            onSearch={handleOnSearch}
            onClear={handleOnClearSearch}
          />
          <RadioButtonGroup
            name="search-filter"
            value={radioGroupState as string}
            data={getFeedFilterData(t, isUserAdmin)}
            onChange={handleRadioButtonGroupChange}
          />

          {!showUserList ? (
            <InfiniteScroll
              dataLength={feedDataLength}
              next={() => {
                if (!isFetchingNextPage) {
                  fetchNextFeedPage();
                }
              }}
              hasMore={hasNextFeedPage ?? false}
              loader={<Loader />}
              endMessage={
                !isFeedLoading && (
                  <Row justifyContent="center" mt="2rem">
                    <Text color={theme.textPrimaryColor}>
                      {t("components.infinite_scroll.end_message")}
                    </Text>
                  </Row>
                )
              }
            >
              {isFeedLoading ? (
                <Loader />
              ) : (
                <FeedList
                  feed={feedItems}
                  virtualPlaylists={virtualPlaylists}
                />
              )}
            </InfiniteScroll>
          ) : (
            <InfiniteScroll
              dataLength={usersDataLength}
              next={fetchNextUsersPage}
              hasMore={hasNextUsersPage ?? false}
              loader={<Loader />}
              endMessage={
                !isUsersLoading && (
                  <Row justifyContent="center" mt="2rem">
                    <Text color={theme.textPrimaryColor}>
                      {t("components.infinite_scroll.end_message")}
                    </Text>
                  </Row>
                )
              }
            >
              {isUsersLoading ? <Loader /> : <UserFeedList users={users} />}
            </InfiniteScroll>
          )}
        </Column>
      </Section>
    </Container>
  );
};

export default FeedPage;
