import { AnchorLink, Button, Column, Row } from "@/components/shared";
import { Card } from "@/components/shared/card/card";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import Text from "@/components/shared/text/text";
import { ROUTES } from "@/constants/routes.constants";
import router from "@/routes/router";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

const SECTION_ID = "about";

const ActionColumn = styled(Column)`
  flex: 0 0 100%;

  @media (min-width: 720px) {
    flex: 0 0 33.333%;
  }
`;

const ActionRow = styled(Row)`
  flex-wrap: wrap;

  @media (min-width: 720px) {
    flex-wrap: nowrap;
  }
`;

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  const handleCreateAccount = () => {
    router.navigate(ROUTES.SIGNUP);
  };

  const handleInstallApp = () => {
    router.navigate(ROUTES.INSTALL);
  };

  const handleSignIn = () => {
    router.navigate(ROUTES.SIGNIN);
  };

  return (
    <Container>
      <h2>{t("page.about.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />

        <ActionRow>
          <ActionColumn pr={[0, 1, 2]}>
            <Card
              style={{ display: "flex" }}
              flex="auto"
              mt={3}
              px={[2, 3, 4]}
              py={4}
              justifyContent="center"
            >
              <Button buttonType="secondary" onClick={handleCreateAccount}>
                Create Account
              </Button>
            </Card>
          </ActionColumn>
          <ActionColumn pr={[0, 1, 2]}>
            <Card
              style={{ display: "flex" }}
              flex="auto"
              mt={3}
              px={[2, 3, 4]}
              py={4}
              justifyContent="center"
            >
              <Button buttonType="secondary" onClick={handleSignIn}>
                {t("header.login")}
              </Button>
            </Card>
          </ActionColumn>
          <ActionColumn pr={[0, 1, 2]}>
            <Card
              style={{ display: "flex" }}
              flex="auto"
              mt={3}
              px={[2, 3, 4]}
              py={4}
              justifyContent="center"
            >
              <Button buttonType="secondary" onClick={handleInstallApp}>
                Install App
              </Button>
            </Card>
          </ActionColumn>
        </ActionRow>

        <Text>
          <p>
            Discover and experience the latest generative AI visuals from the
            greatest artists.
          </p>
          <ul>
            <li>
              Install infinidream on your Mac to get the best experience. The
              infinidream app provides unsurpassed support for ambient
              interaction, including speed control.
            </li>
            <li>
              It includes a screensaver that can run automatically when you're
              not using your computer.
            </li>
            <li>
              Install the web app on your phone to remote-control your
              infinidream from anywhere.
            </li>
          </ul>
          <p>
            Curate playlists, connect and learn from other fans on Discord or
            social media. Become a creator yourself!
          </p>
          <p>
            <AnchorLink to={ROUTES.SIGNUP}>Create an account</AnchorLink>,{" "}
            <AnchorLink to={ROUTES.INSTALL}>install the app</AnchorLink>, and
            begin the experience. Learn more on the{" "}
            <AnchorLink to="https://infinidream.ai/">landing page</AnchorLink>.
          </p>
        </Text>
      </Section>
    </Container>
  );
};

export default AboutPage;
