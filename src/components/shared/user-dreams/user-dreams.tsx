import { useEffect, useState } from "react";
import { useFeed } from "@/api/feed/query/useFeed";
import { Column, ItemCard, ItemCardList, Row } from "@/components/shared";
import { Paginate } from "@/components/shared/paginate/paginate";
import { Spinner } from "@/components/shared/spinner/spinner";
import Text from "@/components/shared/text/text";
import { PAGINATION } from "@/constants/pagination.constants";
import { useTranslation } from "react-i18next";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";
import { FeedItemFilterType } from "@/types/feed.types";
import { ItemType } from "../item-card/item-card";
import { usePaginateProps } from "@/hooks/usePaginateProps";

type UserDreamsProps = {
  userUUID?: string;
  grid?: boolean;
  columns?: number;
  type?: FeedItemFilterType;
};

const UserDreams: React.FC<UserDreamsProps> = ({
  userUUID,
  grid,
  columns = 2,
  type
}) => {
  const { t } = useTranslation();
  const {
    marginPagesDisplayed,
    pageRangeDisplayed,
    breakLabel,
    previousLabel,
    nextLabel,
    renderOnZeroPageCount
  } = usePaginateProps();
  const [page, setPage] = useState<number>(0);
  const { data, isLoading, isRefetching } = useFeed({
    page,
    userUUID,
    type
  });
  const feed = data?.data?.feed;
  const pageCount = Math.ceil((data?.data?.count ?? 1) / PAGINATION.TAKE);
  const handleonPageChange = ({ selected }: { selected: number }) => {
    setPage(selected);
  };

  // reset page to 0 when type changes
  useEffect(() => {
    setPage(0);
  }, [type]);

  return (
    <Row flex="auto">
      <Column flex="auto">
        {isLoading || isRefetching ? (
          <Row justifyContent="center">
            <Spinner />
          </Row>
        ) : feed?.length ? (
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
        ) : (
          <Text>{t("components.my_dreams.empty")}</Text>
        )}

        <Row justifyContent="center" margin="0">
          <Paginate
            breakLabel={breakLabel}
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            marginPagesDisplayed={marginPagesDisplayed}
            pageRangeDisplayed={pageRangeDisplayed}
            renderOnZeroPageCount={renderOnZeroPageCount}
            forcePage={page}
            onPageChange={handleonPageChange}
            pageCount={pageCount}
          />
        </Row>
      </Column>
    </Row>
  );
};

export default UserDreams;
