import { Column, Row, Anchor } from "@/components/shared";
import Container from "@/components/shared/container/container";
import JekyllSiteViewer from "@/components/shared/jekyll-viewer/jekyll-viewer";
import { Section } from "@/components/shared/section/section";
import Text from "@/components/shared/text/text";
import { useTranslation } from "react-i18next";

const SECTION_ID = "help";

export const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <h2>{t("page.help.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />
	<h3>Links to Documentation</h3>
	<Text>
	  See the Users Manual for explanation of the app and website,
	  {" "}<Anchor href="https://docs.google.com/document/u/1/d/e/2PACX-1vTQnJMCLOqenrCADZyrXxgBTahQ4sPyRRj7GrhMEu_DkmScRRGOjRJQmd2rkH1-_K0WRjfGYd04rhJB/pub">Creators' Guide</Anchor>, and the
	  {" "}<Anchor href="https://github.com/e-dream-ai/python-api">Python API</Anchor>.
	</Text>
	<h3>Installation Video Walkthrough</h3>
        <Column flex="auto" style={{ height: "70vh", minHeight: "800px" }}>
          <JekyllSiteViewer />
        </Column>
      </Section>
    </Container>
  );
};

export default HelpPage;
