import { Button, Column, Row } from "@/components/shared";
import { Anchor } from "@/components/shared";
import AddToHomeScreen from "@/components/shared/add-home-screen/add-home-screen";
import { Card } from "@/components/shared/card/card";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import Text from "@/components/shared/text/text";
import usePWAInstall from "@/hooks/usePWAInstall";
import useUserAgent from "@/hooks/useUserAgent";
import { APP_VERSION } from "@/version";
import {
  faApple,
  faLinux,
  faWindows,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

const SECTION_ID = "install";
const DISPLAY_APP_VERSION = `v${APP_VERSION}`;
const MAC_APP_URL = `https://github.com/e-dream-ai/client/releases/download/${APP_VERSION}/infinidream-${APP_VERSION}.zip`;
const WINDOWS_APP_URL = `https://github.com/e-dream-ai/client/releases/download/${APP_VERSION}/infinidream-windows-${APP_VERSION}-setup.exe`;
const LINUX_APP_URL = `https://github.com/e-dream-ai/client/releases/download/${APP_VERSION}/infinidream-${APP_VERSION}-x86_64.AppImage`;

const ResponsiveDownloadButton = styled(Button)`
  max-width: 100%;
  text-wrap: wrap;
  white-space: normal;
  overflow-wrap: anywhere;
  text-align: center;
  line-height: 1.2;
  height: 100%;
`;

const PlatformCard = styled(Card)`
  position: relative;
`;

const PlatformIcon = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 2.25rem;
  line-height: 1;
  color: ${(props) => props.theme.textAccentColor};
`;

const InstallSection = () => {
  const { t } = useTranslation();
  const { isMacOS, isLinux } = useUserAgent();

  const handleDownloadMac = () => {
    window.open(MAC_APP_URL, "_blank");
  };

  const handleDownloadWindows = () => {
    window.open(WINDOWS_APP_URL, "_blank");
  };

  const handleDownloadLinux = () => {
    window.open(LINUX_APP_URL, "_blank");
  };

  const macCard = (
    <Row flexWrap={["wrap", "nowrap", "nowrap"]} key="mac">
      <PlatformCard flex="auto" mt={3} px={[2, 3, 4]} py={4}>
        <PlatformIcon>
          <FontAwesomeIcon icon={faApple} />
        </PlatformIcon>
        <Row justifyContent="center">
          <ResponsiveDownloadButton
            buttonType="secondary"
            onClick={handleDownloadMac}
          >
            Download for Mac
          </ResponsiveDownloadButton>
        </Row>
        <Row>
          <Text>
            <p>
              <em>Requirements:</em> macOS 12.4+, x86 or Apple Silicon.
            </p>
            <p>
              Unzip, and drag it to your Applications folder. Run it, sign-in by
              entering your email, then enter the code emailed to you, and close
              the settings.
            </p>
          </Text>
        </Row>
      </PlatformCard>
    </Row>
  );

  const windowsCard = (
    <Row flexWrap={["wrap", "nowrap", "nowrap"]} key="windows">
      <PlatformCard flex="auto" mt={3} px={[2, 3, 4]} py={4}>
        <PlatformIcon>
          <FontAwesomeIcon icon={faWindows} />
        </PlatformIcon>
        <Row justifyContent="center">
          <ResponsiveDownloadButton
            buttonType="secondary"
            onClick={handleDownloadWindows}
          >
            Download for Windows
          </ResponsiveDownloadButton>
        </Row>
        <Row>
          <Text>
            <p>
              <em>Requirements:</em> Windows 10 or later (x64).
            </p>
            <p>
              Run the installer, sign-in by entering your email, then enter the
              code emailed to you.
            </p>
          </Text>
        </Row>
      </PlatformCard>
    </Row>
  );

  const linuxCard = (
    <Row flexWrap={["wrap", "nowrap", "nowrap"]} key="linux">
      <PlatformCard flex="auto" mt={3} px={[2, 3, 4]} py={4}>
        <PlatformIcon>
          <FontAwesomeIcon icon={faLinux} />
        </PlatformIcon>
        <Row justifyContent="center">
          <ResponsiveDownloadButton
            buttonType="secondary"
            onClick={handleDownloadLinux}
          >
            Download for Linux
          </ResponsiveDownloadButton>
        </Row>
        <Row>
          <Text>
            <p>
              <em>Requirements:</em> Linux x86_64 with Vulkan support.
            </p>
            <p>
              Make the{" "}
              <Anchor target="_blank" href="https://appimage.org/">
                AppImage
              </Anchor>{" "}
              executable (<code>chmod +x</code>) and run it. Sign-in by entering
              your email, then enter the code emailed to you.
            </p>
          </Text>
        </Row>
      </PlatformCard>
    </Row>
  );

  const orderedCards = isMacOS
    ? [macCard, windowsCard, linuxCard]
    : isLinux
      ? [linuxCard, windowsCard, macCard]
      : [windowsCard, macCard, linuxCard];

  return (
    <>
      <h2>{t("page.install.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />
        {orderedCards}
        <Text>
          <p>
            Each time you sign-in, a fresh code is required. Never reuse the
            codes emailed to you.
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
