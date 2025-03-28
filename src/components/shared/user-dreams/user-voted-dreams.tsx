import { useMemo } from "react";
import { Column, ItemCard, ItemCardList, Row } from "@/components/shared";
import Text from "@/components/shared/text/text";
import { useTranslation } from "react-i18next";
import { useInfiniteUserVotedDreams } from "@/api/user/query/useInfiniteUserVotedDreams";
import { VoteType } from "@/types/vote.types";
import { Loader } from "../loader/loader";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTheme } from "styled-components";

type UserVotedDreamsProps = {
  userUUID?: string;
  grid?: boolean;
  columns?: number;
  type?: VoteType;
};

const UserVotedDreams: React.FC<UserVotedDreamsProps> = ({
  userUUID,
  grid,
  columns = 2,
  type
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    data,
    isLoading,
    isRefetching,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteUserVotedDreams({
    userUUID,
    type
  });

  const dreams = useMemo(() => data?.pages.flatMap(page => page.data?.dreams ?? []) ?? [], [data]);
  const dreamsLength = useMemo(() => dreams.length, [dreams]);

  return (
    <Row flex="auto">
      <Column flex="auto">
        {isLoading || isRefetching ? (
          <Loader />
        ) : dreams?.length ? (
          <InfiniteScroll
            dataLength={dreamsLength}
            next={fetchNextPage}
            hasMore={hasNextPage ?? false}
            loader={<Loader />}
            endMessage={
              !isLoading &&
              <Row justifyContent="center" mt="2rem">
                <Text color={theme.textPrimaryColor}>{t("components.infinite_scroll.end_message")}</Text>
              </Row>
            }
          >
            <ItemCardList grid={grid} columns={columns}>
              {dreams?.map((dream) =>
                <ItemCard
                  type="dream"
                  item={dream}
                  key={dream.uuid}
                  size="lg"
                  showPlayButton
                />
              )}
            </ItemCardList></InfiniteScroll>
        ) : (
          <Text>{t("components.item_card_list.empty")}</Text>
        )}
      </Column>
    </Row>
  );
};

export default UserVotedDreams;
