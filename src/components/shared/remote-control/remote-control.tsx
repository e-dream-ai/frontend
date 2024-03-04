import React, { useEffect } from "react";
import { Button, Row } from "@/components/shared";
import {
  REMOTE_CONTROLS,
  REMOTE_CONTROLS_TRANSLATIONS,
} from "@/constants/remote-control.constants";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import useIO from "@/hooks/useIO";
import { getRemoteControlEvent } from "@/utils/remote-control.util";
import { RemoteControlAction } from "@/types/remote-control.types";
import Grid from "@/components/shared/grid/grid";

const NEW_REMOTE_CONTROL_EVENT = "new_remote_control_event";

const ROW_1 = [REMOTE_CONTROLS.HELP, REMOTE_CONTROLS.STATUS];

const ROW_2 = [
  REMOTE_CONTROLS.SET_SPEED_1,
  REMOTE_CONTROLS.SET_SPEED_2,
  REMOTE_CONTROLS.SET_SPEED_3,
  REMOTE_CONTROLS.SET_SPEED_4,
  REMOTE_CONTROLS.SET_SPEED_5,
  REMOTE_CONTROLS.SET_SPEED_6,
  REMOTE_CONTROLS.SET_SPEED_7,
  REMOTE_CONTROLS.SET_SPEED_8,
  REMOTE_CONTROLS.SET_SPEED_9,
  REMOTE_CONTROLS.PAUSE_1,
];

export const RemoteControl: React.FC = () => {
  const { t } = useTranslation();
  const { io } = useIO();

  // Listen for events from the server
  useEffect(() => {
    io?.on(NEW_REMOTE_CONTROL_EVENT, (data): void => {
      const event: RemoteControlAction | undefined = getRemoteControlEvent(
        data?.event,
      );

      if (!event) {
        return;
      }

      const key = event?.key;

      if (event) {
        toast.info(
          `${t("components.remote_control.event")}: ${
            key ? `(${key})` : ""
          } ${t(REMOTE_CONTROLS_TRANSLATIONS[event?.key])}`,
        );
      }
    });

    // Cleanup on component unmount
    return () => {
      io?.off(NEW_REMOTE_CONTROL_EVENT);
    };
  }, [io, t]);

  // Emit an event to the server
  const sendMessage = (event: string) => () => {
    io?.emit(NEW_REMOTE_CONTROL_EVENT, { event: event });
  };

  return (
    <Row flexWrap="wrap" style={{ gap: "4px" }}>
      <Grid
        gridTemplateRows="repeat(4, auto)"
        gridTemplateColumns="repeat(10, auto)"
        gridGap="0.2rem"
      >
        {/* ROW 1 */}
        {ROW_1.map((remoteControl) => {
          return (
            <Button
              buttonType="tertiary"
              size="sm"
              fontSize="0.6rem"
              onClick={sendMessage(remoteControl?.event)}
            >
              {remoteControl.key +
                " " +
                t(`components.remote_control.${remoteControl?.event}`)}
            </Button>
          );
        })}
        <p />
        <p />
        <p />
        <p />
        <p />
        <p />
        <p />
        <p />
        {/* ROW 2 */}
        {ROW_2.map((remoteControl) => {
          return (
            <Button
              buttonType="tertiary"
              size="sm"
              fontSize="0.6rem"
              onClick={sendMessage(remoteControl?.event)}
            >
              {remoteControl.key +
                " " +
                t(`components.remote_control.${remoteControl?.event}`)}
            </Button>
          );
        })}
        {/* ROW 3 */}
        <p />
        <Button
          buttonType="tertiary"
          size="sm"
          fontSize="0.6rem"
          onClick={sendMessage(REMOTE_CONTROLS.BRIGHTER.event)}
        >
          {REMOTE_CONTROLS.BRIGHTER.key +
            " " +
            t(`components.remote_control.${REMOTE_CONTROLS.BRIGHTER.event}`)}
        </Button>
        <p />
        <p />
        <p />
        <p />
        <p />
        <p />
        <p />
        <p />
        {/* ROW 4 */}
        <Button
          buttonType="tertiary"
          size="sm"
          fontSize="0.6rem"
          onClick={sendMessage(REMOTE_CONTROLS.PLAYBACK_SLOWER.event)}
        >
          {REMOTE_CONTROLS.PLAYBACK_SLOWER.key +
            " " +
            t(
              `components.remote_control.${REMOTE_CONTROLS.PLAYBACK_SLOWER.event}`,
            )}
        </Button>
        <Button
          buttonType="tertiary"
          size="sm"
          fontSize="0.6rem"
          onClick={sendMessage(REMOTE_CONTROLS.DARKER.event)}
        >
          {REMOTE_CONTROLS.DARKER.key +
            " " +
            t(`components.remote_control.${REMOTE_CONTROLS.DARKER.event}`)}
        </Button>
        <Button
          buttonType="tertiary"
          size="sm"
          fontSize="0.6rem"
          onClick={sendMessage(REMOTE_CONTROLS.PLAYBACK_FASTER.event)}
        >
          {REMOTE_CONTROLS.PLAYBACK_FASTER.key +
            " " +
            t(
              `components.remote_control.${REMOTE_CONTROLS.PLAYBACK_FASTER.event}`,
            )}
        </Button>
        <p />
        <p />
        <p />
        <Button
          buttonType="tertiary"
          size="sm"
          fontSize="0.6rem"
          onClick={sendMessage(REMOTE_CONTROLS.BACKWARD.event)}
        >
          {REMOTE_CONTROLS.BACKWARD.key +
            " " +
            t(`components.remote_control.${REMOTE_CONTROLS.BACKWARD.event}`)}
        </Button>
        <Button
          buttonType="tertiary"
          size="sm"
          fontSize="0.6rem"
          onClick={sendMessage(REMOTE_CONTROLS.PAUSE_2.event)}
        >
          {REMOTE_CONTROLS.PAUSE_2.key +
            " " +
            t(`components.remote_control.${REMOTE_CONTROLS.PAUSE_2.event}`)}
        </Button>
        <Button
          buttonType="tertiary"
          size="sm"
          fontSize="0.6rem"
          onClick={sendMessage(REMOTE_CONTROLS.FORWARD.event)}
        >
          {REMOTE_CONTROLS.FORWARD.key +
            " " +
            t(`components.remote_control.${REMOTE_CONTROLS.FORWARD.event}`)}
        </Button>
        <p />
        {/* ROW 5 */}
        <p />
        <p />
        <Button
          buttonType="tertiary"
          size="sm"
          fontSize="0.6rem"
          onClick={sendMessage(REMOTE_CONTROLS.CREDIT.event)}
        >
          {REMOTE_CONTROLS.CREDIT.key +
            " " +
            t(`components.remote_control.${REMOTE_CONTROLS.CREDIT.event}`)}
        </Button>
        <Button
          buttonType="tertiary"
          size="sm"
          fontSize="0.6rem"
          onClick={sendMessage(REMOTE_CONTROLS.WEB.event)}
        >
          {REMOTE_CONTROLS.WEB.key +
            " " +
            t(`components.remote_control.${REMOTE_CONTROLS.WEB.event}`)}
        </Button>
        <p />
        <p />
        <p />
        <p />
        <Button
          buttonType="tertiary"
          size="sm"
          fontSize="0.6rem"
          onClick={sendMessage(REMOTE_CONTROLS.LIKE_CURRENT_DREAM.event)}
        >
          {REMOTE_CONTROLS.LIKE_CURRENT_DREAM.key +
            " " +
            t(
              `components.remote_control.${REMOTE_CONTROLS.LIKE_CURRENT_DREAM.event}`,
            )}
        </Button>
        {/* ROW 5 */}
        <p />
        <p />
        <p />
        <p />
        <p />
        <p />
        <p />
        <p />
        <Button
          buttonType="tertiary"
          size="sm"
          fontSize="0.6rem"
          onClick={sendMessage(REMOTE_CONTROLS.GO_PREVIOUS_DREAM.event)}
        >
          {REMOTE_CONTROLS.GO_PREVIOUS_DREAM.key +
            " " +
            t(
              `components.remote_control.${REMOTE_CONTROLS.GO_PREVIOUS_DREAM.event}`,
            )}
        </Button>

        <Button
          buttonType="tertiary"
          size="sm"
          fontSize="0.6rem"
          onClick={sendMessage(REMOTE_CONTROLS.DISLIKE_CURRENT_DREAM.event)}
        >
          {REMOTE_CONTROLS.DISLIKE_CURRENT_DREAM.key +
            " " +
            t(
              `components.remote_control.${REMOTE_CONTROLS.DISLIKE_CURRENT_DREAM.event}`,
            )}
        </Button>

        <Button
          buttonType="tertiary"
          size="sm"
          fontSize="0.6rem"
          onClick={sendMessage(REMOTE_CONTROLS.GO_NEXT_DREAM.event)}
        >
          {REMOTE_CONTROLS.GO_NEXT_DREAM.key +
            " " +
            t(
              `components.remote_control.${REMOTE_CONTROLS.GO_NEXT_DREAM.event}`,
            )}
        </Button>
        {/* {Object.keys(REMOTE_CONTROLS).map((key) => {
          const REMOTE_CONTROL = REMOTE_CONTROLS[key];
          return (
            <Button
              buttonType="tertiary"
              size="sm"
              fontSize="0.6rem"
              onClick={sendMessage(REMOTE_CONTROL?.event)}
            >
              {REMOTE_CONTROL.key +
                " " +
                t(`components.remote_control.${REMOTE_CONTROL?.event}`)}
            </Button>
          );
        })} */}
      </Grid>
    </Row>
  );
};
