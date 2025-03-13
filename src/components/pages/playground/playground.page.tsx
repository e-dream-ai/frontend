import { useTranslation } from "react-i18next";
import Container from "@/components/shared/container/container";
import Text from "@/components/shared/text/text";
import { Button, Row } from "@/components/shared";
import {
  GOOD_BYE_EVENT,
  PING_REDIS_EVENT,
  PING_EVENT,
} from "@/constants/remote-control.constants";
import useSocket from "@/hooks/useSocket";

export const PlaygroundPage: React.FC = () => {
  const { t } = useTranslation();
  const { emit } = useSocket();

  // Emit ping event to the server
  const sendPingEvent = () => {
    emit(PING_EVENT);
  };

  // Emit ping redis event to the server
  const sendPingRedisEvent = () => {
    emit(PING_REDIS_EVENT);
  };

  // Emit bye event to the server
  const sendGoodbyeEvent = () => {
    emit(GOOD_BYE_EVENT);
  };

  return (
    <>
      <Container>
        <h2>{t("page.playground.title")}</h2>

        <Row separator pb="1rem" mb="1rem">
          <Text>{t("page.playground.client")}</Text>
        </Row>
        <Row>
          <Button
            key="ping"
            buttonType="tertiary"
            size="sm"
            fontSize="0.6rem"
            textTransform="none"
            mr="0.4rem"
            onClick={sendPingEvent}
          >
            {t("page.playground.ping")}
          </Button>
          <Button
            key="ping"
            buttonType="tertiary"
            size="sm"
            fontSize="0.6rem"
            textTransform="none"
            mr="0.4rem"
            onClick={sendPingRedisEvent}
          >
            {t("page.playground.ping_redis")}
          </Button>
          <Button
            key="pong"
            buttonType="tertiary"
            size="sm"
            fontSize="0.6rem"
            textTransform="none"
            onClick={sendGoodbyeEvent}
          >
            {t("page.playground.goodbye")}
          </Button>
        </Row>
      </Container>
    </>
  );
};

export default PlaygroundPage;
