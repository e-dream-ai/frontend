import { Button, Column, Row } from "@/components/shared";
import { Anchor } from "@/components/shared";
import AddToHomeScreen from "@/components/shared/add-home-screen/add-home-screen";
import { Card } from "@/components/shared/card/card";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import Text from "@/components/shared/text/text";
import usePWAInstall from "@/hooks/usePWAInstall";
import useUserAgent from "@/hooks/useUserAgent";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const SECTION_ID = "install";

const APP_VERSION = "0.7.0";
const DISPLAY_APP_VERSION = `v${APP_VERSION}`;
const APP_URL = `https://github.com/e-dream-ai/public/releases/download/${APP_VERSION}/infinidream-app-${APP_VERSION}.zip`;
const SCREENSAVER_URL = `https://github.com/e-dream-ai/public/releases/download/${APP_VERSION}/infinidream-screensaver-${APP_VERSION}.zip`;

const InstallSection = () => {
  const { t } = useTranslation();
  const { isMacOS } = useUserAgent();

  const handleDownloadApp = () => {
    window.open(APP_URL, "_blank");
  };

  const handleDownloadScreensaver = () => {
    window.open(SCREENSAVER_URL, "_blank");
  };

  return (
    <>
      <h2>{t("page.install.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />
        <Text>
          <p>
            <em>Requirements:</em> macOS version 12.4+, x86 or Apple Silicon.
          </p>
          {!isMacOS && (
            <p>
              <b>
                Warning: currently infinidream is for macOS only, but this computer
                appears to be something else.
              </b>
            </p>
          )}
        </Text>
        <Row flexWrap={["wrap", "nowrap", "nowrap"]}>
          <Column
            flex={[
              "0 0 100%", // full width on small screens
              "0 0 50%", // half width on medium screens and up
            ]}
            pr={[0, 1, 2]}
          >
            <Card flex="auto" mt={3} px={[2, 3, 4]} py={4}>
              <Row justifyContent="center">
                <Button buttonType="secondary" onClick={handleDownloadApp}>
                  Download app
                </Button>
              </Row>
              <Row>
                <Text>
                  Unzip, and drag it to your Applications folder. Run it,
                  sign-in by entering your e-mail, then enter the code e-mailed
                  to you, and close the settings. The app will automatically
                  download and play visuals. Press the A and D keys to adjust
                  the speed of the experience, or the F1 key for help with all
                  the commands.
                </Text>
              </Row>
            </Card>
          </Column>
          <Column
            flex={[
              "0 0 100%", // full width on small screens
              "0 0 50%", // half width on medium screens and up
            ]}
            pr={[0, 1, 2]}
          >
            <Card flex="auto" mt={3} px={[2, 3, 4]} py={4}>
              <Row justifyContent="center">
                <Button
                  buttonType="secondary"
                  onClick={handleDownloadScreensaver}
                >
                  Download screensaver
                </Button>
              </Row>

              <Column>
                <Text>
                  Unzip, and double-click to install. If prompted, install for
                  all users. Then to enable it, go into System Settings, select
                  the "Screen Saver" panel, and then in the "Other" section
                  click on "Show More" and then click on "infinidream". Whew!
                </Text>
              </Column>
            </Card>
          </Column>
        </Row>
        <Text>
          <p>
            The screensaver shares its settings and account with the app, and we
            recommend using the app to configure it.
          </p>
          <p>
            Each time you sign-in, a fresh code is required. Never reuse the
            codes e-mailed to you.
          </p>
        </Text>
        <Text>
          <p>
            Current release: {DISPLAY_APP_VERSION}. See the{" "}
            <Anchor
              target="_blank"
              href="https://github.com/e-dream-ai/public/releases/latest"
            >
              release notes
            </Anchor>{" "}
            and{" "}
            <Anchor
              target="_blank"
              href="https://github.com/e-dream-ai/public/releases"
            >
              past releases
            </Anchor>
            .
          </p>
        </Text>
      </Section>
    </>
  );
};

const RemoteControlSection = () => {
  const { t } = useTranslation();
  const { isInstallable, install } = usePWAInstall();
  const [showAddHomeScreen, setShowAddHomeScreen] = useState(false);

  const onShowAddHomeScreen = () => setShowAddHomeScreen(true);
  const onHideAddHomeScreen = () => setShowAddHomeScreen(false);

  const handleInstallRemoteControl = () => {
    install();
  };

  return (
    <>
      <AddToHomeScreen isOpen={showAddHomeScreen} onClose={onHideAddHomeScreen} />

      <h2>{t("page.install.title_remote")}</h2>
      <Section id="install_remote">
        <Row justifyContent="space-between" separator />

        {!isInstallable && (
          <Card flex="auto" mt={3} px={[2, 3, 4]} py={4}>
            <Row justifyContent="center" m={0}>
              <Button
                buttonType="secondary"
                onClick={onShowAddHomeScreen}
              >
                Install Remote Control
              </Button>
            </Row>
	    <Row>
	      <Text><p>
	        Just click to install the remote control on your phone or tablet.
		Run it, sign-in, and enjoy complete control of infinidream on your
                laptop or computer from a distance.
	      </p></Text>
	    </Row>
          </Card>
        )}

        {isInstallable && (
          <Card flex="auto" mt={3} px={[2, 3, 4]} py={4}>
            <Row justifyContent="center" m={0}>
              <Button
                buttonType="secondary"
                onClick={handleInstallRemoteControl}
              >
                Install Remote Control
              </Button>
            </Row>
	    <Row>
	      <Text><p>
	        Just click to install the remote control on your phone or tablet.
		Run it, sign-in, and enjoy complete control of infinidream on your
                laptop or computer from a distance.
	      </p></Text>
	    </Row>
          </Card>
        )}

        <Text>
	  <p>
	    The remote control feature works from any web browser where
	    you sign in, not just a mobile device. The remote control is a PWA
	    (Progressive Web App) that can be installed without the app store.
	  </p>
        </Text>
      </Section>
    </>
  );
};

export const InstallPage: React.FC = () => {
  const { isMobile } = useUserAgent();

  return (
    <>
      <Container>
        {isMobile ? (
          <>
            <RemoteControlSection />
            <p>&nbsp;</p>
            <InstallSection />
          </>
        ) : (
          <>
            <InstallSection />
            <p>&nbsp;</p>
            <RemoteControlSection />
          </>
        )}
      </Container>
    </>
  );
};

export default InstallPage;
