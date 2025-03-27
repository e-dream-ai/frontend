import { useFeed } from "@/api/feed/query/useFeed";
import { Column, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { ItemCard, ItemCardList } from "@/components/shared";
// import { Paginate } from "@/components/shared/paginate/paginate";
import RadioButtonGroup from "@/components/shared/radio-button-group/radio-button-group";
import SearchBar from "@/components/shared/search-bar/search-bar";
import { Section } from "@/components/shared/section/section";
import { Spinner } from "@/components/shared/spinner/spinner";
// import { PAGINATION } from "@/constants/pagination.constants";
import { useTranslation } from "react-i18next";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";
import UserCard, { UserCardList } from "../user-card/user-card";
import { FEED_FILTERS, getFeedFilterData } from "@/constants/feed.constants";
import { useUsers } from "@/api/user/query/useUsers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FeedItem, FeedItemFilterType, FeedItemType, PlaylistWithDreams } from "@/types/feed.types";
import { User } from "@/types/auth.types";
import Text from "@/components/shared/text/text";
import { ROLES } from "@/constants/role.constants";
import { RoleType } from "@/types/role.types";
import useAuth from "@/hooks/useAuth";
import { isAdmin } from "@/utils/user.util";
import { ItemType } from "@/components/shared/item-card/item-card";
// import { usePaginateProps } from "@/hooks/usePaginateProps";
import { groupFeedDreamItemsByPlaylist } from "@/utils/feed.util";
import { getVirtualPlaylistDisplayedDreams } from "@/utils/virtual-playlist.util";
import InfiniteScroll from "react-infinite-scroll-component";
import { PAGINATION } from "@/constants/pagination.constants";

const USER_TAKE = {
  SEARCH: 3,
  USER_FILTER: 10,
};

const SECTION_ID = "feed";

// Helper function to determine if item should be skipped from render
// Only should skip dreams that are included on dreamsInVirtualPlaylists
const shouldSkipItem = (item: FeedItem, dreamsInVirtualPlaylists: string[]): boolean => {
  return (item.dreamItem && dreamsInVirtualPlaylists.includes(item.dreamItem.uuid)) ?? false;
}

export const FeedPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isUserAdmin = useMemo(() => isAdmin(user as User), [user]);
  const [page, setPage] = useState<number>(0);
  const [usersPage, setUsersPage] = useState<number>(0);
  const [search, setSearch] = useState<string | undefined>();
  const [radioGroupState, setRadioGroupState] = useState<
    FeedItemType | undefined
  >(FEED_FILTERS.ALL);
  // const {
  //   marginPagesDisplayed,
  //   pageRangeDisplayed,
  //   breakLabel,
  //   previousLabel,
  //   nextLabel,
  //   renderOnZeroPageCount
  // } = usePaginateProps();

  const getUserFeedType: (type?: FeedItemType) => RoleType | undefined =
    useCallback((type) => {
      if (type === FEED_FILTERS.ALL) return undefined;
      if (type === FEED_FILTERS.DREAM) return undefined;
      if (type === FEED_FILTERS.PLAYLIST) return undefined;
      if (type === FEED_FILTERS.USER) return ROLES.USER_GROUP;
      if (type === FEED_FILTERS.CREATOR) return ROLES.CREATOR_GROUP;
      if (type === FEED_FILTERS.ADMIN) return ROLES.ADMIN_GROUP;
      return undefined;
    }, []);

  const {
    data: feedData,
    isLoading: isFeedLoading,
    isRefetching: isFeedRefetching,
    fetchNextPage,
    hasNextPage,
  } = useFeed({
    page,
    search,
    type: radioGroupState as FeedItemFilterType,
  });

  const feed = useMemo(() => feedData?.pages.flatMap(page => page.data?.feed ?? []) ?? [], [feedData]);
  const feedDataLength = feedData?.pages.flatMap(page => page.data?.feed).length || 0;
  // const pageCount = useMemo(() => Math.ceil((feedData?.data?.count ?? 1) / PAGINATION.TAKE), [feedData]);
  // const pageCount = useMemo(() =>
  //   Math.ceil(
  //     (feedData?.pages.find(page => Boolean(page.data?.count))?.data?.count ?? 0)
  //     / PAGINATION.TAKE
  //   ), [feedData]);

  // Memoize the virtual playlists grouping operation
  const { virtualPlaylistGroups, dreamsInVirtualPlaylists } = useMemo(() => {
    const groups = groupFeedDreamItemsByPlaylist(feed);
    const dreamUUIDs = new Set<string>();

    // Build set of dream IDs in playlists in the same loop
    groups.forEach(group => {
      group.dreams.forEach(dream => {
        dreamUUIDs.add(dream.uuid);
      });
    });

    return {
      virtualPlaylistGroups: groups,
      dreamsInVirtualPlaylists: Array.from(dreamUUIDs)
    };
  }, [feed]); // Only recompute when feed changes

  // Memoize the playlist entries array
  const virtualPlaylists = useMemo(() =>
    Array.from(virtualPlaylistGroups.entries()).map(([, pl]) => pl),
    [virtualPlaylistGroups]
  );

  const {
    data: usersData,
    isLoading: isUsersLoading,
    isRefetching: isUsersRefetching,
  } = useUsers({
    page: usersPage,
    search,
    take:
      radioGroupState === FEED_FILTERS.USER
        ? USER_TAKE.USER_FILTER
        : USER_TAKE.SEARCH,
    role: getUserFeedType(radioGroupState as FeedItemType),
  });
  const users = usersData?.data?.users;
  // const usersPageCount = Math.ceil(
  //   (usersData?.data?.count ?? 1) / PAGINATION.TAKE,
  // );

  const isLoading =
    isFeedLoading || isFeedRefetching || isUsersLoading || isUsersRefetching;

  const showUserList = [
    FEED_FILTERS.USER,
    FEED_FILTERS.CREATOR,
    FEED_FILTERS.ADMIN,
  ].includes(radioGroupState as FeedItemType);

  // const showUserListTab = showUserList;

  const handleRadioButtonGroupChange = (value?: string) => {
    setRadioGroupState(value as FeedItemType);
    setPage(0);
    setUsersPage(0);
  };

  // const handleOnPageChange = ({ selected }: { selected: number }) => {
  //   setPage(selected);
  // };

  // const handleOnUserPageChange = ({ selected }: { selected: number }) => {
  //   setUsersPage(selected);
  // };

  const handleOnSearch = (value?: string) => {
    if (!value && value !== "") return;
    setSearch(value);
  };

  const handleOnClearSearch = () => {
    setSearch("");
    setPage(0);
    setUsersPage(0);
  };

  useEffect(() => {
    if (hasNextPage && (feedDataLength - dreamsInVirtualPlaylists.length) < PAGINATION.TAKE) {
      fetchNextPage();
    }
  }, [feedDataLength, dreamsInVirtualPlaylists, hasNextPage, fetchNextPage]);

  return (
    <Container>
      <Section id={SECTION_ID}>
        <h2>{t("page.feed.title")}</h2>

        <Column flex="auto">
          <SearchBar
            showClearButton={Boolean(search)}
            onSearch={handleOnSearch}
            onClear={handleOnClearSearch}
          />
          <RadioButtonGroup
            name="search-filter"
            value={radioGroupState as string}
            data={getFeedFilterData(t, isUserAdmin)}
            onChange={handleRadioButtonGroupChange}
          />
          {isLoading ? (
            <Row justifyContent="center">
              <Spinner />
            </Row>
          ) : (
            <InfiniteScroll
              dataLength={feedDataLength}
              next={fetchNextPage}
              hasMore={hasNextPage ?? false}
              loader={
                <Row justifyContent="center">
                  <Spinner />
                </Row>
              }
              endMessage={
                <Row justifyContent="center" mt="2rem">
                  <Text>{t("components.infinity_scroll.end_message")}</Text>
                </Row>
              }
            >
              {showUserList && <UserList users={users} />}
              {
                !showUserList && <>
                  <FeedList
                    feed={feed}
                    virtualPlaylists={virtualPlaylists}
                    dreamsInVirtualPlaylists={dreamsInVirtualPlaylists}
                  />
                </>
              }
            </InfiniteScroll>
          )}
        </Column>

        {/* <Row justifyContent="center" margin="0">
          <Paginate
            breakLabel={breakLabel}
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            marginPagesDisplayed={marginPagesDisplayed}
            pageRangeDisplayed={pageRangeDisplayed}
            renderOnZeroPageCount={renderOnZeroPageCount}
            forcePage={showUserListTab ? usersPage : page}
            onPageChange={
              showUserListTab ? handleOnUserPageChange : handleOnPageChange
            }
            pageCount={showUserListTab ? usersPageCount : pageCount}
          />
        </Row> */}
      </Section>
    </Container>
  );
};

const FeedList: React.FC<{
  feed?: FeedItem[],
  virtualPlaylists: PlaylistWithDreams[],
  dreamsInVirtualPlaylists: string[],
}> = ({ feed, virtualPlaylists, dreamsInVirtualPlaylists, }) => {
  const { t } = useTranslation();
  return (
    <>
      <Row separator pb="1rem" mb="1rem">
        {t("page.feed.feed")}
      </Row>
      {feed?.length ? (
        <>
          <ItemCardList grid columns={3}>
            {
              feed?.map((feedItem) => {
                if (shouldSkipItem(feedItem, dreamsInVirtualPlaylists)) return null;

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
              })
            }
            {
              virtualPlaylists.map((pl) => {
                const dreamsToShow = getVirtualPlaylistDisplayedDreams(pl.dreams);
                return (
                  <>
                    {dreamsToShow.map(dream =>
                      <ItemCard
                        showPlayButton
                        key={`${pl.uuid}_${dream.uuid}`}
                        type="dream"
                        item={dream}
                        size="lg"
                      />
                    )}
                    <ItemCard
                      showPlayButton
                      key={pl.uuid}
                      type="virtual-playlist"
                      item={pl}
                      size="lg"
                    />
                  </>
                )
              })
            }
          </ItemCardList>
        </>
      ) : (
        <Text mb={4}>{t("page.feed.empty_feed")}</Text>
      )}
    </>
  );
};

const UserList: React.FC<{ users?: User[] }> = ({ users }) => {
  const { t } = useTranslation();
  return (
    <>
      <Row separator pb="1rem" mb="1rem">
        {t("page.feed.users")}
      </Row>
      {users?.length ? (
        <UserCardList>
          {users?.map((user) => (
            <UserCard size="sm" key={user.id} user={user} />
          ))}
        </UserCardList>
      ) : (
        <Text mb={4}>{t("page.feed.empty_users")}</Text>
      )}
    </>
  );
};

export default FeedPage;
