import { Row } from "@/components/shared";
import { Anchor } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import Text from "@/components/shared/text/text";
import { ROUTES } from "@/constants/routes.constants";
import { useTranslation } from "react-i18next";

const SECTION_ID = "about";

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <h2>{t("page.about.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />
        <Text>
          <p>
            Discover and experience the latest generative AI visuals from the
            greatest artists.
          </p>
          <p>
            Install e-dream on your Mac to get the best experience. The e-dream
	    app provides unsurpassed support for ambient interaction,
	    including adjustable slow and smooth playback.
          </p>
          <p>
            Install the screensaver so it runs automatically when you're not
	    at your computer.
          </p>
          <p>
            Install the web app on your phone to remote-control your e-dream
            from anywhere.
          </p>
          <p>
            Curate playlists, connect and learn from other fans on Discord or
            social media. Become a creator yourself!
          </p>
          <p>
            <Anchor href={ROUTES.SIGNUP}>
              Create an account
            </Anchor>
            , <Anchor href="/install">install the app</Anchor>,
            and begin the experience.
          </p>
        </Text>
      </Section>
    </Container>
  );
};

export default AboutPage;
