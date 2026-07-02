import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import MyDreamsGrid from "@/components/shared/my-dreams-grid/my-dreams-grid";
import { useTranslation } from "react-i18next";

const SECTION_ID = "my-dreams";

export const MyDreamsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <h2>{t("page.my_dreams.title")}</h2>
      <Section id={SECTION_ID}>
        <MyDreamsGrid grid columns={3} />
      </Section>
    </Container>
  );
};

export default MyDreamsPage;
