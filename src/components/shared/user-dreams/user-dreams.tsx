import { useFeed } from "@/api/feed/query/useFeed";
import { Column, ItemCard, ItemCardList, Row } from "@/components/shared";
import { Paginate } from "@/components/shared/paginate/paginate";
import { Spinner } from "@/components/shared/spinner/spinner";
import Text from "@/components/shared/text/text";
import { PAGINATION } from "@/constants/pagination.constants";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";

type UserDreamsProps = {
  userId?: number;
  grid?: boolean;
  columns?: number;
};

const UserDreams: React.FC<UserDreamsProps> = ({
  userId,
  grid,
  columns = 2,
}) => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(0);
  const { data, isLoading, isRefetching } = useFeed({
    page,
    userId,
  });
  const feed = data?.data?.feed;
  const pageCount = Math.ceil((data?.data?.count ?? 1) / PAGINATION.TAKE);
  const handleonPageChange = ({ selected }: { selected: number }) => {
    setPage(selected);
  };
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
                  type={feedItem.type}
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
            breakLabel="..."
            nextLabel={`${t("components.paginate.next")} >`}
            onPageChange={handleonPageChange}
            pageCount={pageCount}
            previousLabel={`< ${t("components.paginate.previous")}`}
            renderOnZeroPageCount={null}
          />
        </Row>
      </Column>
    </Row>
  );
};

export default UserDreams;
