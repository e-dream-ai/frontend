import { useInvites } from "@/api/invites/query/useInvites";
import { Column, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Paginate } from "@/components/shared/paginate/paginate";
import { Section } from "@/components/shared/section/section";
import { Spinner } from "@/components/shared/spinner/spinner";
import Text from "@/components/shared/text/text";
import { PAGINATION } from "@/constants/pagination.constants";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const SECTION_ID = "invites";

export const InvitesPage: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState<number>(0);
  const { data, isLoading, isRefetching } = useInvites({
    page,
  });
  const invites = data?.data?.invites;
  const pageCount = Math.ceil((data?.data?.count ?? 1) / PAGINATION.TAKE);
  const handleonPageChange = ({ selected }: { selected: number }) => {
    setPage(selected);
  };

  return (
    <Container>
      <h2>{t("page.invites.title")}</h2>
      <Section id={SECTION_ID}>
        <Row flex="auto">
          <Column flex="auto">
            {isLoading || isRefetching ? (
              <Row justifyContent="center">
                <Spinner />
              </Row>
            ) : invites?.length ? (
              <ol>
                {invites?.map((invite) => {
                  return <li>{invite.code}</li>;
                })}
              </ol>
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
      </Section>
    </Container>
  );
};

export default InvitesPage;
