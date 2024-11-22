import { Button, Column, Row } from "@/components/shared";
import { Anchor } from "@/components/shared";
import { Card } from "@/components/shared/card/card";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import Text from "@/components/shared/text/text";
import { useTranslation } from "react-i18next";

const SECTION_ID = "install";

const APP_VERSION = "0.5.0";
const APP_URL = `https://github.com/e-dream-ai/public/releases/download/${APP_VERSION}/e-dream-app-${APP_VERSION}.zip`;
const SCREENSAVER_URL = `https://github.com/e-dream-ai/public/releases/download/${APP_VERSION}/e-dream-screensaver-${APP_VERSION}.zip`;

export const InstallPage: React.FC = () => {
  const { t } = useTranslation();
  const handleDownloadApp = () => {
    window.open(APP_URL, "_blank");
  };

  const handleDownloadScreensaver = () => {
    window.open(SCREENSAVER_URL, "_blank");
  };

  return (
    <Container>
      <h2>{t("page.install.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />
        <Text>
          <p>
            <em>Requirements:</em> macOS version 11+, x86 or Apple Silicon.
          </p>
          <Row flexWrap="wrap">
            <Column
              flex={[
                "0 0 100%", // full width on small screens
                "0 0 50%", // half width on medium screens and up
              ]}
              // py={3}
              pr={[0, 2]}
            >
              <Card
                style={{
                  height: "220px",
                  marginTop: "1rem",
                }}
              >
                <Row justifyContent="center">
                  <Button buttonType="secondary" onClick={handleDownloadApp}>
                    Download app
                  </Button>
                </Row>
                <Row>
                  Unzip, and drag it to your Applications folder. Run it,
                  sign-in by entering your e-mail, then enter the code e-mailed
                  to you, and close the settings. The app will automatically
                  download and play visuals. Press the A and D keys to adjust
                  the speed of the experience, or the F1 key for help with all
                  the commands.
                </Row>
              </Card>
            </Column>
            <Column
              flex={[
                "0 0 100%", // full width on small screens
                "0 0 50%", // half width on medium screens and up
              ]}
              // py={3}
              pl={[0, 2]}
            >
              <Card
                style={{
                  height: "220px",
                  marginTop: "1rem",
                }}
              >
                <Row justifyContent="center">
                  <Button
                    buttonType="secondary"
                    onClick={handleDownloadScreensaver}
                  >
                    Download screensaver
                  </Button>
                </Row>

                <Column>
                  Unzip, and double-click to install. If prompted, install for
                  all users. Then to enable it, go into System Settings, select
                  the "Screen Saver" panel, and then in the "Other" section
                  click on "Show More" and then click on "e-dream". Whew!
                </Column>
              </Card>
            </Column>
          </Row>
          <p>
            The screensaver shares its settings and account with the app, and we
            recommend using the app to configure it.
          </p>
          <p>
            See the{" "}
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
