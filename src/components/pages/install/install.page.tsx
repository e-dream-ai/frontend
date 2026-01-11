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

const APP_VERSION = "0.12.0";
const DISPLAY_APP_VERSION = `v${APP_VERSION}`;
const APP_URL = `https://github.com/e-dream-ai/client/releases/download/${APP_VERSION}/infinidream-${APP_VERSION}.zip`;

const InstallSection = () => {
  const { t } = useTranslation();
  const { isMacOS } = useUserAgent();

  const handleDownloadApp = () => {
    window.open(APP_URL, "_blank");
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
                Warning: currently infinidream is for macOS only, but this
                computer appears to be something else.
              </b>
            </p>
          )}
        </Text>
        <Row flexWrap={["wrap", "nowrap", "nowrap"]}>
          <Card flex="auto" mt={3} px={[2, 3, 4]} py={4}>
            <Row justifyContent="center">
              <Button buttonType="secondary" onClick={handleDownloadApp}>
                Download app and screen saver
              </Button>
            </Row>
            <Row>
              <Text>
                Unzip, and drag it to your Applications folder. Run it, sign-in
                by entering your e-mail, then enter the code e-mailed to you,
                and close the settings.
              </Text>
            </Row>
          </Card>
        </Row>
        <Text>
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
              href="https://github.com/e-dream-ai/client/releases/latest"
            >
              release notes
            </Anchor>{" "}
            and{" "}
            <Anchor
              target="_blank"
              href="https://github.com/e-dream-ai/client/releases"
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
  const { installationType, install } = usePWAInstall();
  const [showAddHomeScreen, setShowAddHomeScreen] = useState(false);

  const onShowAddHomeScreen = () => setShowAddHomeScreen(true);
  const onHideAddHomeScreen = () => setShowAddHomeScreen(false);

  const handleInstallRemoteControl = async () => {
    if (installationType === "prompt") {
      await install();
    } else if (installationType === "manual") {
      onShowAddHomeScreen();
    }
  };

  return (
    <>
      <AddToHomeScreen
        isOpen={showAddHomeScreen}
        onClose={onHideAddHomeScreen}
      />

      <h2>{t("page.install.title_remote")}</h2>
      <Section id="install_remote">
        <Row justifyContent="space-between" separator />

        {installationType === "desktop" && (
          <Card flex="auto" mt={3} px={[2, 3, 4]} py={4}>
            <Row>
              <Text>
                <p>
                  <strong>
                    Install the remote control on your mobile device
                  </strong>
                </p>
                <p>
                  The remote control is designed for phones and tablets. Open
                  this page on your mobile device to install it and enjoy
                  complete control of infinidream on your laptop or computer
                  from a distance.
                </p>
              </Text>
            </Row>
          </Card>
        )}

        {installationType === "prompt" && (
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
              <Text>
                <p>
                  Click to install the remote control. Your browser will show an
                  install dialog - just confirm to add it to your home screen.
                  Once installed, sign-in and enjoy complete control of
                  infinidream on your laptop or computer from a distance.
                </p>
              </Text>
            </Row>
          </Card>
        )}

        {installationType === "manual" && (
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
              <Text>
                <p>
                  Click the button above to see instructions for adding the
                  remote control to your home screen. Once installed, sign-in
                  and enjoy complete control of infinidream on your laptop or
                  computer from a distance.
                </p>
              </Text>
            </Row>
          </Card>
        )}

        {installationType === "none" && (
          <Card flex="auto" mt={3} px={[2, 3, 4]} py={4}>
            <Row>
              <Text>
                <p>
                  <strong>Remote control is already installed!</strong>
                </p>
                <p>
                  You're currently using the installed version of the remote
                  control. Sign-in to enjoy complete control of infinidream on
                  your laptop or computer from a distance.
                </p>
              </Text>
            </Row>
          </Card>
        )}

        <Text>
          <p>
            The remote control feature works from any web browser where you sign
            in, not just a mobile device. The remote control is a PWA
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
          <Row flexDirection={["column", "column", "row"]} alignItems="stretch">
            <Column flex="1" pr={[0, 0, 3]}>
              <InstallSection />
            </Column>
            <Column flex="1" pl={[0, 0, 3]}>
              <RemoteControlSection />
            </Column>
          </Row>
        )}
      </Container>
    </>
  );
};

export default InstallPage;
