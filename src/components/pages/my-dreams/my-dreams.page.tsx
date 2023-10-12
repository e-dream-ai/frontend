import { useMyDreams } from "api/dream/query/useMyDreams";
import Container from "components/shared/container/container";
import {
  DreamCard,
  DreamCardList,
} from "components/shared/dream-card/dream-card";
import { Section } from "components/shared/section/section";
import { Spinner } from "components/shared/spinner/spinner";
import { useTranslation } from "react-i18next";

const SECTION_ID = "my-dreams";

export const MyDreamsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useMyDreams();
  const dreams = data?.data?.dreams;

  return (
    <Container>
      <h2>{t("page.my_dreams.title")}</h2>
      <Section id={SECTION_ID}>
        {isLoading ? (
          <>
            <Spinner />
          </>
        ) : (
          <DreamCardList>
            {dreams?.map((dream) => (
              <DreamCard dream={dream} key={dream.uuid} />
            ))}
          </DreamCardList>
        )}
      </Section>
    </Container>
  );
};

export default MyDreamsPage;
