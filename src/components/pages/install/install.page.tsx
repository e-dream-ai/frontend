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
          <p><em>Requirements:</em> macOS version 11+, x86 or Apple Silicon.</p>
          <p>
            Download and unzip the app and/or screen saver from the {" "}
	    <Anchor target="_blank" href="https://drive.google.com/drive/folders/1I2SHmq6eRuN836c13GWyaq4kGC3aiLZM">
	      release
	    </Anchor>
	    {" "} folder, and then:
            <ul>
	      <li>
                Drag the e-dream native app to your Applications folder then run it. Open the settings, log in, then close the settings.
		The app will automatically download and play visuals. Press F1 key for help and F2 key for status. Use the A and D keys
		to adjust the speed of the experience.
	      </li>
	      <li>
	        Double click the screen saver to install it. Then to enable it, go into
	        System Settings, select the "Screen Saver" panel, and
	        then in the "Other" section click on "Show More" and then
	        click on "e-dream".
	      </li>
	    </ul>
          </p>
        </Text>
      </Section>
      <p>&nbsp;</p>
      <h2>{t("page.install.title_remote")}</h2>
      <Section id="install_remote">
        <Row justifyContent="space-between" separator />
        <Text>
          <p>
	    Install <Anchor target="_blank" href="/">this web app</Anchor> on your phone or tablet to use as a remote control.
	    <ul>
	      <li>
	        On iOS, share the app to your Home Screen.
	      </li>
	      <li>
	        On Android, use the "Install App" menu item in Chrome.
	      </li>
	    </ul>
	    Run the app, log in, and then enjoy complete control of your laptop or computer from a distance.
	  </p>
	</Text>
      </Section>
    </Container>
  );
};

export default InstallPage;
