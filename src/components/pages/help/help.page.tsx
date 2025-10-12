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
        <Text>
          <p>
            Quick tips:
            <ul>
              <li>
                Use AirPlay to connect your laptop to a TV without cables.
              </li>
              <li>
                In the settings of the app, increase the disk cache to get a
                better experience.
              </li>
            </ul>
            See the{" "}
            <Anchor href="https://docs.google.com/document/d/e/2PACX-1vRK77s1OWASmJ_r8ZZXkFzNxpSxoqcOVn2-0shwXZquzxsWfzO86oeH_9Q09IVmb5gaUnuHZQP0ZihG/pub">
              Users' Manual
            </Anchor>{" "}
            for explanation of the app and website, the{" "}
            <Anchor href="https://docs.google.com/document/u/1/d/e/2PACX-1vTQnJMCLOqenrCADZyrXxgBTahQ4sPyRRj7GrhMEu_DkmScRRGOjRJQmd2rkH1-_K0WRjfGYd04rhJB/pub">
              Creators' Guide
            </Anchor>{" "}
            for how to make your own dreams, and the{" "}
            <Anchor href="https://github.com/e-dream-ai/python-api">
              Python API
            </Anchor>{" "}
            for how to connect your own code. Or watch the following
            installation and basic usage walkthrough:
          </p>
        </Text>
        <Column flex="auto" style={{ height: "70vh", minHeight: "800px" }}>
          <JekyllSiteViewer />
        </Column>
      </Section>
    </Container>
  );
};

export default HelpPage;
