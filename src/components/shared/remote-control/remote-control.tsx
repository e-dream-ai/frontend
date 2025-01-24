import React, { useEffect } from "react";
import { Button } from "@/components/shared";
import {
  REMOTE_CONTROLS,
  NEW_REMOTE_CONTROL_EVENT,
} from "@/constants/remote-control.constants";
import { useTranslation } from "react-i18next";
import useSocket from "@/hooks/useSocket";
import { RemoteControlContainer } from "./remote-control.styled";
import { onNewRemoteControlEvent } from "@/utils/socket.util";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import { RemoteControlEvent, RemoteControlEventData } from "@/types/remote-control.types";
import { useWebClient } from "@/hooks/useWebClient";

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
  const { emit } = useSocket();
  const { isWebClientActive, handlers } = useWebClient();

  const handleRemoteControlEvent = onNewRemoteControlEvent(t);

  /**
   * Listen new remote control events from the server
   */
  useSocketEventListener<RemoteControlEventData>(
    NEW_REMOTE_CONTROL_EVENT,
    handleRemoteControlEvent,
  );

  // Emit an event to the server
  const sendMessage = (event: RemoteControlEvent) => () => {
    emit(NEW_REMOTE_CONTROL_EVENT, { event: event, isWebClientEvent: isWebClientActive });

    /**
     * if isWebClientActive then execute handler
     */
    if (isWebClientActive) {
      handlers?.[event]();
    }
  };

  useEffect(() => {
    // Create a mapping of trigger keys to events
    const keyToEventMap = new Map<string, RemoteControlEvent>();
    Object.values(REMOTE_CONTROLS).forEach(({ event, triggerKey }) => {
      if (triggerKey) {
        // handle multiple keys for same event
        triggerKey.split(', ').forEach(k => keyToEventMap.set(k, event));
      }
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      // check if this key triggers an event
      const eventName: RemoteControlEvent | undefined = keyToEventMap.get(key);

      if (eventName) {
        event.preventDefault();
      }

      /**
       * if isWebClientActive then execute handler
       */
      if (isWebClientActive && eventName) {
        handlers?.[eventName]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers, isWebClientActive]);

  return (
    <RemoteControlContainer>
      {/* ROW 1 */}
      <p />
      {ROW_1.map((remoteControl) => {
        return (
          <Button
            key={remoteControl.event}
            buttonType="tertiary"
            size="sm"
            fontSize="0.8rem"
            textTransform="none"
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
            key={remoteControl.event}
            buttonType="tertiary"
            size="sm"
            fontSize="0.8rem"
            textTransform="none"
            onClick={sendMessage(remoteControl?.event)}
          >
            {remoteControl.key +
              " " +
              t(`components.remote_control.${remoteControl?.event}`)}
          </Button>
        );
      })}
      <p />

      {/* ROW 3 */}
      <p />
      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
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
      <p />

      {/* ROW 4 */}
      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
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
        fontSize="0.8rem"
        textTransform="none"
        onClick={sendMessage(REMOTE_CONTROLS.DARKER.event)}
      >
        {REMOTE_CONTROLS.DARKER.key +
          " " +
          t(`components.remote_control.${REMOTE_CONTROLS.DARKER.event}`)}
      </Button>
      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
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
      <p />

      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
        onClick={sendMessage(REMOTE_CONTROLS.BACKWARD.event)}
      >
        {REMOTE_CONTROLS.BACKWARD.key +
          " " +
          t(`components.remote_control.${REMOTE_CONTROLS.BACKWARD.event}`)}
      </Button>
      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
        onClick={sendMessage(REMOTE_CONTROLS.PAUSE_2.event)}
      >
        {REMOTE_CONTROLS.PAUSE_2.key +
          " " +
          t(`components.remote_control.${REMOTE_CONTROLS.PAUSE_2.event}`)}
      </Button>
      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
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
      <p />
      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
        onClick={sendMessage(REMOTE_CONTROLS.CREDIT.event)}
      >
        {REMOTE_CONTROLS.CREDIT.key +
          " " +
          t(`components.remote_control.${REMOTE_CONTROLS.CREDIT.event}`)}
      </Button>
      <Button
        buttonType="tertiary"
        size="sm"
        fontSize="0.8rem"
        textTransform="none"
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
      <p />
      <p />
      {/* ROW 5 */}
      <p />
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
        fontSize="0.8rem"
        textTransform="none"
        onClick={sendMessage(REMOTE_CONTROLS.LIKE_CURRENT_DREAM.event)}
      >
        {REMOTE_CONTROLS.LIKE_CURRENT_DREAM.key +
          " " +
          t(
            `components.remote_control.${REMOTE_CONTROLS.LIKE_CURRENT_DREAM.event}`,
          )}
      </Button>
      <p />

      {/* ROW 6 */}
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
        fontSize="0.8rem"
        textTransform="none"
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
        fontSize="0.8rem"
        textTransform="none"
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
        fontSize="0.8rem"
        textTransform="none"
        onClick={sendMessage(REMOTE_CONTROLS.GO_NEXT_DREAM.event)}
      >
        {REMOTE_CONTROLS.GO_NEXT_DREAM.key +
          " " +
          t(`components.remote_control.${REMOTE_CONTROLS.GO_NEXT_DREAM.event}`)}
      </Button>

      {/* ROW 7 */}
    </RemoteControlContainer>
  );
};
