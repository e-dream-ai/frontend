import { Row } from "@/components/shared";
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
	    E-dream is a community for generative AI visuals and all
	    animated artwork.
	  </p>
	  <p>
	    Discover and experience the latest animations from the
	    greatest artists.
	  </p>
	  <p>
	    Install e-dream on your Mac to get the highest quality
	    experience, including interaction, screensaver
	    integration, and remote control. The e-dream native client
	    provides unsurpassed support for ambient use, including
	    adjustable super slow and smooth playback.
	  </p>
	  <p>
	    Curate playlists or upload your own creations and earn
	    based on views of your work.
	  </p>
	  <p>
	    Connect and learn from other fans on Discord or social
	    media. Become a creator yourself!
	  </p>
	  <p>
	    Create an account, install the native client, and begin
	    the experience.
	  </p>
        </Text>
      </Section>
    </Container>
  );
};

export default AboutPage;
