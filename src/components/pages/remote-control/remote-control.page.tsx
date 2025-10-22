import { Row } from "@/components/shared";
import Container from "@/components/shared/container/container";
import { Section } from "@/components/shared/section/section";
import { useTranslation } from "react-i18next";
import { RemoteControl } from "@/components/shared/remote-control/remote-control";
import { CurrentDream } from "@/components/shared/current-dream/current-dream";
import { CurrentPlaylist } from "@/components/shared/current-playlist/current-playlist";
import { VideoJS } from "@/components/shared/video-js/video-js";
import { useWebClient } from "@/hooks/useWebClient";
import { Button } from "@/components/shared";

const SECTION_ID = "remote-control";

const RemoteControlPage: React.FC = () => {
  const { t } = useTranslation();
  const { isWebClientActive, startWebPlayer } = useWebClient();

  return (
    <Container>
      <h2>{t("page.remote_control.title")}</h2>
      <Section id={SECTION_ID}>
        <Row justifyContent="space-between" separator />
        <Row justifyContent="center" my="2rem">
          <RemoteControl />
        </Row>
        {!isWebClientActive && (
          <Row justifyContent="center" my="1rem">
            <Button
              buttonType="secondary"
              onClick={(e) => {
                e.preventDefault();
                startWebPlayer();
              }}
            >
              Start Web Player
            </Button>
          </Row>
        )}
        {isWebClientActive && <VideoJS />}
        <CurrentDream />
        <CurrentPlaylist />
      </Section>
    </Container>
  );
};

export default RemoteControlPage;
