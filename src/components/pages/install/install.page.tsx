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
          <p>
            <em>Requirements:</em> macOS version 11+, x86 or Apple Silicon.
          </p>
          <ul>
	    <li>
	      <Anchor target="_blank" href="https://github.com/e-dream-ai/public/releases/download/0.4.5/e-dream-app-0.4.5.zip">
		Download the app
	      </Anchor>,
	      unzip, and drag it to your Applications folder. Run it, and
	      open the app settings. Sign-in by entering your e-mail, then enter the
	      code e-mailed to you, and close the settings. The app will
	      automatically download and play visuals. Press the A and D keys to adjust the speed of the experience, or the F1 key for
	      help with all the commands.
	    </li>
	    <li>
	      <Anchor target="_blank" href="https://github.com/e-dream-ai/public/releases/download/0.4.5/e-dream-screensaver-0.4.5.zip">
	      Download the screensaver </Anchor>,
	      unzip, and double-click to install. If prompted, install for all
	      users. Then to enable it, go into System Settings, select the
	      "Screen Saver" panel, and then in the "Other" section click on
	      "Show More" and then click on "e-dream". Whew!
	    </li>
	  </ul>
	  <p>
	    The screensaver shares its settings and account with the app, and we
	    recommend using the app to configure it.
	  </p>
	  <p>
	    See the <Anchor target="_blank" href="https://github.com/e-dream-ai/public/releases/latest">
	    release notes</Anchor>{' '} and
            {' '}<Anchor target="_blank" href="https://github.com/e-dream-ai/public/releases">
	    past releases</Anchor>.
	  </p>
        </Text>
      </Section>
      <p>&nbsp;</p>
      <h2>{t("page.install.title_remote")}</h2>
      <Section id="install_remote">
        <Row justifyContent="space-between" separator />
        <Text>
          <p />
          Install{" "}
          <Anchor target="_blank" href="/">
            this web app
          </Anchor>{" "}
          on your phone or tablet to use it as a remote control.
          <ul>
            <li>On iOS, share the app to your Home Screen.</li>
            <li>On Android, use the "Install App" menu item in Chrome.</li>
          </ul>
          Run the app, sign in, and enjoy complete control of e-dream on your
          laptop or computer from a distance.
        </Text>
      </Section>
    </Container>
  );
};

export default InstallPage;
