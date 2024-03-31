import { Row } from "@/components/shared";
import { Anchor } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import Text from "@/components/shared/text/text";
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
            Discover and experience the latest generative AI animations from the
            greatest artists.
          </p>
          <p>
            Install e-dream on your Mac to get the best experience,
            including interaction and screensaver integration.
            The e-dream native client provides unsurpassed support for
            ambient situations, including adjustable slow and smooth
	    playback.
          </p>
          <p>
            Install the web app on your phone to control your e-dream
            from anywhere.
	  </p>
          <p>
            Curate playlists, connect and learn from other fans on Discord or
            social media. Become a creator yourself!
          </p>
          <p>
            <Anchor href="/signup">Sign up</Anchor>, then{" "}
            <Anchor href="/install">install</Anchor> the native client, and
            begin the experience.
          </p>
        </Text>
      </Section>
    </Container>
  );
};

export default AboutPage;
