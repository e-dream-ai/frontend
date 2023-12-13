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
import useAuth from "hooks/useAuth";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { User } from "types/auth.types";
import { Dream } from "types/dream.types";
import { Playlist } from "types/playlist.types";
import UserCard from "../user-card/user-card";

const SECTION_ID = "feed";

export const FeedPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [page, setPage] = useState<number>(0);
  const [radioGroupState, setRadioGroupState] = useState<string | undefined>(
    "ALL",
  );
  const { data, isLoading, isRefetching } = useFeed({
    page,
  });
  const feed = data?.data?.feed;
  const pageCount = Math.ceil((data?.data?.count ?? 0) / PAGINATION.TAKE);

  const handleonPageChange = ({ selected }: { selected: number }) => {
    setPage(selected);
  };

  return (
    <Container>
      <h2>{t("page.feed.title")}</h2>
      <Section id={SECTION_ID}>
        {isLoading || isRefetching ? (
          <Row justifyContent="center">
            <Spinner />
          </Row>
        ) : (
          <Row justifyContent="center" alignItems="center">
            <Column>
              <SearchBar />
              <RadioButtonGroup
                name="search-filter"
                value={radioGroupState}
                data={[
                  { key: "All", value: "ALL" },
                  { key: "Dreams", value: "DREAMS" },
                  { key: "Playlists", value: "PLAYLISTS" },
                  { key: "Users", value: "USERS" },
                ]}
                onChange={(value) => setRadioGroupState(value)}
              />
              <UserCard user={user as User} />
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
                    <ItemCard
                      key={feedItem.id}
                      type={feedItem.type}
                      item={item}
                    />
                  );
                })}
              </ItemCardList>
            </Column>
          </Row>
        )}

        <Row justifyContent="center">
          <Paginate
            breakLabel="..."
            nextLabel={`${t("components.paginate.next")} >`}
            onPageChange={handleonPageChange}
            pageCount={pageCount}
            previousLabel={`< ${t("components.paginate.previous")}`}
            renderOnZeroPageCount={null}
          />
        </Row>
      </Section>
    </Container>
  );
};

export default FeedPage;
