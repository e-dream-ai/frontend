import { useMyDreams } from "api/dream/query/useMyDreams";
import { Row } from "components/shared";
import Container from "components/shared/container/container";
import {
  DreamCard,
  DreamCardList,
} from "components/shared/dream-card/dream-card";
import { Paginate } from "components/shared/paginate/paginate";
import { Section } from "components/shared/section/section";
import { Spinner } from "components/shared/spinner/spinner";
import Text from "components/shared/text/text";
import { PAGINATION } from "constants/pagination.constants";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const SECTION_ID = "my-dreams";

export const MyDreamsPage: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(0);
  const { data, isLoading, isRefetching } = useMyDreams({
    page,
  });
  const dreams = data?.data?.dreams;
  const pageCount = Math.max((data?.data?.count ?? 0) / PAGINATION.TAKE, 1);

  const handleonPageChange = ({ selected }: { selected: number }) => {
    setPage(selected);
  };

  return (
    <Container>
      <h2>{t("page.my_dreams.title")}</h2>
      <Section id={SECTION_ID}>
        {isLoading || isRefetching ? (
          <Row justifyContent="center">
            <Spinner />
          </Row>
        ) : dreams?.length ? (
          <DreamCardList>
            {dreams?.map((dream) => (
              <DreamCard dream={dream} key={dream.uuid} />
            ))}
          </DreamCardList>
        ) : (
          <Text>{t("page.my_dreams.empty")}</Text>
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

export default MyDreamsPage;
