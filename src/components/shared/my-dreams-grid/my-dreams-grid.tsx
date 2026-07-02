import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import InfiniteScroll from "react-infinite-scroll-component";
import { Column, ItemCard, ItemCardList, Row } from "@/components/shared";
import Text from "@/components/shared/text/text";
import { useMyDreamsInfinite } from "@/api/dream/query/useMyDreamsInfinite";
import { Loader } from "../loader/loader";

type MyDreamsGridProps = {
  grid?: boolean;
  columns?: number;
  search?: string;
  mediaType?: "image" | "video";
  userUUID?: string;
};

const MyDreamsGrid: React.FC<MyDreamsGridProps> = ({
  grid,
  columns = 2,
  search,
  mediaType,
  userUUID,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { data, isLoading, fetchNextPage, hasNextPage } = useMyDreamsInfinite({
    search,
    mediaType,
    userUUID,
  });

  const dreams = useMemo(
    () => data?.pages.flatMap((page) => page.data?.dreams ?? []) ?? [],
    [data],
  );

  return (
    <Row flex="auto">
      <Column flex="auto">
        {isLoading ? (
          <Loader />
        ) : dreams.length ? (
          <InfiniteScroll
            dataLength={dreams.length}
            next={fetchNextPage}
            hasMore={hasNextPage ?? false}
            loader={<Loader />}
            endMessage={
              <Row justifyContent="center" mt="2rem">
                <Text color={theme.textPrimaryColor}>
                  {t("components.infinite_scroll.end_message")}
                </Text>
              </Row>
            }
          >
            <ItemCardList grid={grid} columns={columns}>
              {dreams.map((dream) => (
                <ItemCard
                  type="dream"
                  item={dream}
                  key={dream.uuid}
                  size="lg"
                  showPlayButton
                  showStatusBadge
                />
              ))}
            </ItemCardList>
          </InfiniteScroll>
        ) : (
          <Text>{t("components.my_dreams.empty")}</Text>
        )}
      </Column>
    </Row>
  );
};

export default MyDreamsGrid;
