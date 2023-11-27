import Container from "components/shared/container/container";
import MyDreams from "components/shared/my-dreams/my-dreams";
import { Section } from "components/shared/section/section";
import { useTranslation } from "react-i18next";

const SECTION_ID = "my-dreams";

export const MyDreamsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <h2>{t("page.my_dreams.title")}</h2>
      <Section id={SECTION_ID}>
        <MyDreams />
      </Section>
    </Container>
  );
};

export default MyDreamsPage;
