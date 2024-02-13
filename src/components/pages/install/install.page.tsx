import { Row } from "@/components/shared";
import { Anchor } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import Text from "@/components/shared/text/text";
import { useTranslation } from "react-i18next";

const SECTION_ID = "install";

export const InstallPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <h2>{t("page.install.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />
        <Text>
          <p>Requirements: Mac OS, x86 or Apple Silicon.</p>
          <p>
            <Anchor href="https://drive.google.com/drive/u/1/folders/1-luT_kzFfJqMDeuyDDhXTLjbFfRNmm7t">Download</Anchor>{" "}
            and open the DMG, then control-click and open the package installer.
          </p>
          <p>
            Run the e-dream app, open the settings, log in, and press
            OK to close the settings. The app will automatically
            download and play visuals. Press F1 key for help and F2
            key for status.
          </p>
          <p>
            It also installs a screen saver. To enable it, go into
	    the system settings, select the "Screen Saver" panel, and
	    then in the Other section click on "Show More" and then
	    click on e-dream.
          </p>
	  <p>
	    Hints to avoid bugs and get the best from this alpha client:
	    <ul>
	      <li>
	        When you first run it, press F2 and confirm it is
	        downloading and let it download everything, then exit
	        and restart the app, then advance through the content
	        with the right arrow.
	      </li>
	      <li>
	        The most unique commands to try are the A and D keys,
		which control the speed of playback. Try pressing the
		A key ten times to really slow it down.
	      </li>
	    </ul>
	  </p>
        </Text>
      </Section>
    </Container>
  );
};

export default InstallPage;
