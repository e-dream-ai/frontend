import { useEffect, useState } from "react";
import { Column, ItemCard, ItemCardList, Row } from "@/components/shared";
import { Paginate } from "@/components/shared/paginate/paginate";
import { Spinner } from "@/components/shared/spinner/spinner";
import Text from "@/components/shared/text/text";
import { PAGINATION } from "@/constants/pagination.constants";
import { useTranslation } from "react-i18next";
import { useUserVotedDreams } from "@/api/user/query/useUserVotedDreams";
import { VoteType } from "@/types/vote.types";
import { usePaginateProps } from "@/hooks/usePaginateProps";

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
  const {
    marginPagesDisplayed,
    pageRangeDisplayed,
    breakLabel,
    previousLabel,
    nextLabel,
    renderOnZeroPageCount
  } = usePaginateProps();
  const [page, setPage] = useState<number>(0);
  const { data, isLoading, isRefetching } = useUserVotedDreams({
    page,
    userUUID,
    type
  });
  const dreams = data?.data?.dreams;
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
        ) : dreams?.length ? (
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
          </ItemCardList>
        ) : (
          <Text>{t("components.item_card_list.empty")}</Text>
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

export default UserVotedDreams;
