import { useMyPlaylists } from "@/api/playlist/query/useMyPlaylists";
import { ItemCard, ItemCardList, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Paginate } from "@/components/shared/paginate/paginate";
import { Section } from "@/components/shared/section/section";
import { Spinner } from "@/components/shared/spinner/spinner";
import { PAGINATION } from "@/constants/pagination.constants";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Playlist } from "@/types/playlist.types";
import { usePaginateProps } from "@/hooks/usePaginateProps";

const SECTION_ID = "playlists";

export const PlaylistsPage: React.FC = () => {
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
  const { data, isLoading, isRefetching } = useMyPlaylists({ page });
  const playlists: Playlist[] = data?.data?.playlists ?? [];
  const pageCount = Math.ceil((data?.data?.count ?? 1) / PAGINATION.TAKE);
  const handleonPageChange = ({ selected }: { selected: number }) => {
    setPage(selected);
  };

  return (
    <Container>
      <h2>{t("page.playlists.title")}</h2>
      <Section id={SECTION_ID}>
        {isLoading || isRefetching ? (
          <Row justifyContent="center">
            <Spinner />
          </Row>
        ) : (
          <ItemCardList grid columns={3}>
            {playlists?.map((playlist) => (
              <ItemCard
                type="playlist"
                item={playlist}
                key={playlist.uuid}
                size="lg"
              />
            ))}
          </ItemCardList>
        )}

        <Row justifyContent="center" margin="0">
          <Paginate
            breakLabel={breakLabel}
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            marginPagesDisplayed={marginPagesDisplayed}
            pageRangeDisplayed={pageRangeDisplayed}
            renderOnZeroPageCount={renderOnZeroPageCount}
            onPageChange={handleonPageChange}
            pageCount={pageCount}
          />
        </Row>
      </Section>
    </Container>
  );
};

export default PlaylistsPage;
