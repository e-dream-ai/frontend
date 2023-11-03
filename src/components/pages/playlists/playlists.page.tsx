import { useMyPlaylists } from "api/playlist/query/useMyPlaylists";
import { Row } from "components/shared";
import Container from "components/shared/container/container";
import { Paginate } from "components/shared/paginate/paginate";
import {
  PlaylistCard,
  PlaylistCardList,
} from "components/shared/playlist-card/playlist-card";
import { Section } from "components/shared/section/section";
import { Spinner } from "components/shared/spinner/spinner";
import { PAGINATION } from "constants/pagination.constants";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Playlist } from "types/playlist.types";

const SECTION_ID = "playlists";

export const PlaylistsPage: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(0);
  const { data, isLoading, isRefetching } = useMyPlaylists({ page });
  const playlists: Playlist[] = data?.data?.playlists ?? [];
  const pageCount = (data?.data?.count ?? 0) / PAGINATION.TAKE;

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
          <PlaylistCardList>
            {playlists?.map((playlist) => (
              <PlaylistCard playlist={playlist} key={playlist.id} />
            ))}
          </PlaylistCardList>
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

export default PlaylistsPage;
