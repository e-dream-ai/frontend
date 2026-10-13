import InfiniteScroll from "react-infinite-scroll-component";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import { Row } from "@/components/shared";
import { Loader } from "@/components/shared/loader/loader";
import Text from "@/components/shared/text/text";

interface PlaylistBrowseListProps {
  dataLength: number;
  hasMore: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
  emptyMessage: string;
  children: React.ReactNode;
}

export const PlaylistBrowseList = ({
  dataLength,
  hasMore,
  isFetchingMore,
  onLoadMore,
  emptyMessage,
  children,
}: PlaylistBrowseListProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Row style={{ display: "block" }}>
      {dataLength ? (
        <InfiniteScroll
          dataLength={dataLength}
          next={() => {
            if (!isFetchingMore) onLoadMore();
          }}
          hasMore={hasMore}
          loader={<Loader />}
          endMessage={
            <Row justifyContent="center" mt="2rem">
              <Text color={theme.textPrimaryColor}>
                {t("components.infinite_scroll.end_message")}
              </Text>
            </Row>
          }
        >
          {children}
        </InfiniteScroll>
      ) : (
        <Text mb={4}>{emptyMessage}</Text>
      )}
    </Row>
  );
};
