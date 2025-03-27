import { useFeed } from "@/api/feed/query/useFeed";
import { Column, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import RadioButtonGroup from "@/components/shared/radio-button-group/radio-button-group";
import SearchBar from "@/components/shared/search-bar/search-bar";
import { Section } from "@/components/shared/section/section";
import { Spinner } from "@/components/shared/spinner/spinner";
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
import { groupFeedDreamItemsByPlaylist } from "@/utils/feed.util";
import InfiniteScroll from "react-infinite-scroll-component";
import { PAGINATION } from "@/constants/pagination.constants";
import { FeedList } from "./feed-list";
import { UserFeedList } from "./user-feed-list";
import { useInfiniteUsers } from "@/api/user/query/useInfiniteUsers";
import { useDebounce } from "@/hooks/useDebounce";

const USER_TAKE = {
  SEARCH: 3,
  USER_FILTER: 10,
};

const SECTION_ID = "feed";

// Gets user role using `FEED_FILTERS` to fetch users by its type
const getUserFeedType: (type?: FeedItemType) => RoleType | undefined = (type) => {
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

const Loader: React.FC = () => (
  <Row justifyContent="center" mt="2rem">
    <Spinner />
  </Row>
);

export const FeedPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const [searchValue, setSearchValue] = useState<string | undefined>();
  const [search, setSearch] = useState<string | undefined>();
  const [radioGroupState, setRadioGroupState] = useState<
    FeedItemType
  >(FEED_FILTERS.ALL);

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
  } = useFeed({
    search,
    type: radioGroupState as FeedItemFilterType,
  });

  const feed = useMemo(() => feedData?.pages.flatMap(page => page.data?.feed ?? []) ?? [], [feedData]);
  const feedDataLength = feedData?.pages.flatMap(page => page.data?.feed).length || 0;

  // Memoize the virtual playlists grouping operation
  const { virtualPlaylists, dreamsInVirtualPlaylists } = useMemo(() => {
    // if radioGroupState is FEED_FILTERS.ALL then don't calculate virtual playlist grouping
    if (radioGroupState !== FEED_FILTERS.ALL) {
      return { virtualPlaylists: [], dreamsInVirtualPlaylists: [] };
    }

    const groups = groupFeedDreamItemsByPlaylist(feed);
    const dreamUUIDs = new Set<string>();

    const virtualPlaylists = Array.from(groups.entries()).map(([, pl]) => pl);

    groups.forEach(group => {
      group.dreams.forEach(dream => {
        dreamUUIDs.add(dream.uuid);
      });
    });

    return {
      virtualPlaylists,
      dreamsInVirtualPlaylists: Array.from(dreamUUIDs),
    };
  }, [radioGroupState, feed]);

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

  const users = useMemo(() => usersData?.pages.flatMap(page => page.data?.users ?? []) ?? [], [usersData]);
  const usersDataLength = feedData?.pages.flatMap(page => page.data?.feed).length || 0;

  const showUserList = [
    FEED_FILTERS.USER,
    FEED_FILTERS.CREATOR,
    FEED_FILTERS.ADMIN,
  ].includes(radioGroupState);

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

  useEffect(() => {
    if (hasNextFeedPage && (feedDataLength - dreamsInVirtualPlaylists.length) < PAGINATION.TAKE) {
      fetchNextFeedPage();
    }
  }, [feedDataLength, dreamsInVirtualPlaylists, hasNextFeedPage, fetchNextFeedPage]);

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

          {
            !showUserList ?
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
                {
                  isFeedLoading
                    ? <Loader />
                    : <FeedList
                      feed={feed}
                      virtualPlaylists={virtualPlaylists}
                      dreamsInVirtualPlaylists={dreamsInVirtualPlaylists}
                    />
                }
              </InfiniteScroll>
              :
              <InfiniteScroll
                dataLength={usersDataLength}
                next={fetchNextUsersPage}
                hasMore={hasNextUsersPage ?? false}
                loader={<Loader />}
                endMessage={
                  !isUsersLoading &&
                  <Row justifyContent="center" mt="2rem">
                    <Text>{t("components.infinite_scroll.end_message")}</Text>
                  </Row>
                }
              >
                {
                  isUsersLoading
                    ? <Loader />
                    : <UserFeedList users={users} />
                }
              </InfiniteScroll>
          }

        </Column>
      </Section>
    </Container>
  );
};


export default FeedPage;
