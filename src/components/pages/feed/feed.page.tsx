import { useFeed } from "api/feed/query/useFeed";
import { Column, Row } from "components/shared";
import Container from "components/shared/container/container";
import { ItemCard, ItemCardList } from "components/shared/item-card/item-card";
import { Paginate } from "components/shared/paginate/paginate";
import RadioButtonGroup from "components/shared/radio-button-group/radio-button-group";
import SearchBar from "components/shared/search-bar/search-bar";
import { Section } from "components/shared/section/section";
import { Spinner } from "components/shared/spinner/spinner";
import { PAGINATION } from "constants/pagination.constants";
import { useTranslation } from "react-i18next";
import { Dream } from "types/dream.types";
import { Playlist } from "types/playlist.types";
import UserCard, { UserCardList } from "../user-card/user-card";
import { FEED_FILTERS, getFilterData } from "constants/feed.constants";
import { useUsers } from "api/user/query/useUsers";
import { useCallback, useState } from "react";
import { FeedItem, FeedItemServerType } from "types/feed.types";
import { User } from "types/auth.types";
import Text from "components/shared/text/text";

const USER_TAKE = {
  SEARCH: 3,
  USER_FILTER: 10,
};

const SECTION_ID = "feed";

export const FeedPage: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(0);
  const [usersPage, setUsersPage] = useState<number>(0);
  const [search, setSearch] = useState<string | undefined>();
  const [radioGroupState, setRadioGroupState] = useState<
    FeedItemServerType | undefined
  >(FEED_FILTERS.ALL);

  const getFeedType: (
    type?: FeedItemServerType,
  ) => FeedItemServerType | undefined = useCallback((type) => {
    if (type === FEED_FILTERS.ALL) return undefined;
    if (type === FEED_FILTERS.DREAM) return FEED_FILTERS.DREAM;
    if (type === FEED_FILTERS.PLAYLIST) return FEED_FILTERS.PLAYLIST;
    if (type === FEED_FILTERS.USER) return undefined;

    return undefined;
  }, []);

  const {
    data: feedData,
    isLoading: isFeedLoading,
    isRefetching: isFeedRefetching,
  } = useFeed({
    page,
    search,
    type: getFeedType(radioGroupState),
  });
  const feed = feedData?.data?.feed;
  const pageCount = Math.ceil((feedData?.data?.count ?? 0) / PAGINATION.TAKE);

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
  });
  const users = usersData?.data?.users;
  const usersPageCount = Math.ceil(
    (usersData?.data?.count ?? 0) / PAGINATION.TAKE,
  );

  const isLoading =
    isFeedLoading || isFeedRefetching || isUsersLoading || isUsersRefetching;

  const showUserList =
    radioGroupState === FEED_FILTERS.USER ||
    (search && radioGroupState === FEED_FILTERS.ALL);

  const showUserListTab = radioGroupState === FEED_FILTERS.USER;

  const handleRadioButtonGroupChange = (value?: string) => {
    setRadioGroupState(value);
    setPage(0);
    setUsersPage(0);
  };

  console.log({ page, usersPage });

  const handleOnPageChange = ({ selected }: { selected: number }) => {
    setPage(selected);
  };

  const handleOnUserPageChange = ({ selected }: { selected: number }) => {
    setUsersPage(selected);
  };

  const handleOnSearch = (value?: string) => {
    if (!value && value !== "") return;
    setSearch(value);
  };

  const handleOnClearSearch = () => {
    setSearch("");
    setPage(0);
    setUsersPage(0);
  };

  return (
    <Container>
      <h2>{t("page.feed.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="center" alignItems="center">
          <Column width="-webkit-fill-available">
            <SearchBar
              showClearButton={Boolean(search)}
              onSearch={handleOnSearch}
              onClear={handleOnClearSearch}
            />
            <RadioButtonGroup
              name="search-filter"
              value={radioGroupState as string}
              data={getFilterData(t)}
              onChange={handleRadioButtonGroupChange}
            />
            {isLoading ? (
              <Row justifyContent="center">
                <Spinner />
              </Row>
            ) : (
              <>
                {showUserList && <UserList users={users} />}
                {radioGroupState !== FEED_FILTERS.USER && (
                  <FeedList feed={feed} />
                )}
              </>
            )}
          </Column>
        </Row>

        <Row justifyContent="center">
          <Paginate
            breakLabel="..."
            nextLabel={`${t("components.paginate.next")} >`}
            forcePage={showUserListTab ? usersPage : page}
            onPageChange={
              showUserListTab ? handleOnUserPageChange : handleOnPageChange
            }
            pageCount={showUserListTab ? usersPageCount : pageCount}
            previousLabel={`< ${t("components.paginate.previous")}`}
            renderOnZeroPageCount={null}
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
        {t("page.feed.feed")}
      </Row>
      {feed?.length ? (
        <ItemCardList>
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
              <ItemCard key={feedItem.id} type={feedItem.type} item={item} />
            );
          })}
        </ItemCardList>
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
