import { Column, Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import JekyllSiteViewer from "@/components/shared/jekyll-viewer/jekyll-viewer";
import { Section } from "@/components/shared/section/section";
import { useTranslation } from "react-i18next";

const SECTION_ID = "help";

export const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <h2>{t("page.help.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />

        <Row>
          <Column flex="auto">
            <JekyllSiteViewer />
          </Column>
        </Row>
      </Section>
    </Container>
  );
};

export default HelpPage;
