import React, { useEffect } from "react";
import { Button } from "@/components/shared";
import {
  REMOTE_CONTROLS,
  NEW_REMOTE_CONTROL_EVENT,
} from "@/constants/remote-control.constants";
import { useTranslation } from "react-i18next";
import { useSocket } from "@/hooks/useSocket";
import {
  RemoteControlContainer,
  IconButton,
  IconGroup,
  IconRow,
  ControlContainer,
  RemoteControlRow,
} from "./remote-control.styled";
import { onNewRemoteControlEvent } from "@/utils/socket.util";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import {
  RemoteControlEvent,
  RemoteControlEventData,
} from "@/types/remote-control.types";
import { useWebClient } from "@/hooks/useWebClient";
import { useDesktopClient } from "@/hooks/useDesktopClient";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaStepBackward,
  FaStepForward,
  FaRegClosedCaptioning,
  FaClosedCaptioning,
} from "react-icons/fa";
import { LuTurtle, LuRabbit } from "react-icons/lu";

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
  const { isWebClientActive, handlers, isCreditOverlayVisible } =
    useWebClient();
  const { isActive: isDesktopActive, isCreditOverlayVisible: isDesktopCredit } =
    useDesktopClient();

  const handleRemoteControlEvent = onNewRemoteControlEvent(t);

  useSocketEventListener<RemoteControlEventData>(
    NEW_REMOTE_CONTROL_EVENT,
    handleRemoteControlEvent,
  );

  const sendMessage = (event: RemoteControlEvent) => () => {
    emit(NEW_REMOTE_CONTROL_EVENT, {
      event,
      isWebClientEvent: isWebClientActive,
    });
    if (isWebClientActive) {
      handlers?.[event]?.();
    }
  };

  const handleToggleCaptions = () => {
    sendMessage(REMOTE_CONTROLS.CREDIT.event)();
  };

  // Keyboard handling
  useEffect(() => {
    const keyToEventMap = new Map<string, RemoteControlEvent>();
    Object.values(REMOTE_CONTROLS).forEach(({ event, triggerKey }) => {
      if (triggerKey)
        triggerKey.split(", ").forEach((k) => keyToEventMap.set(k, event));
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      const eventName = keyToEventMap.get(key);
      if (eventName) {
        event.preventDefault();
        emit(NEW_REMOTE_CONTROL_EVENT, {
          event: eventName,
          isWebClientEvent: isWebClientActive,
        });
        if (isWebClientActive) handlers?.[eventName]?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers, isWebClientActive]);

  return (
    <RemoteControlContainer>
      <RemoteControlRow>
        <IconRow>
          <IconButton
            aria-label={t("actions.previous")}
            onClick={sendMessage(REMOTE_CONTROLS.GO_PREVIOUS_DREAM.event)}
          >
            <FaStepBackward size={24} />
          </IconButton>

          <IconGroup>
            <IconButton
              aria-label={t("actions.like")}
              onClick={sendMessage(REMOTE_CONTROLS.LIKE_CURRENT_DREAM.event)}
            >
              <FaThumbsUp size={24} />
            </IconButton>
            <IconButton
              aria-label={t("actions.dislike")}
              onClick={sendMessage(REMOTE_CONTROLS.DISLIKE_CURRENT_DREAM.event)}
            >
              <FaThumbsDown size={24} />
            </IconButton>
          </IconGroup>

          <IconButton
            aria-label={t("actions.next")}
            onClick={sendMessage(REMOTE_CONTROLS.GO_NEXT_DREAM.event)}
          >
            <FaStepForward size={24} />
          </IconButton>

          <IconButton
            aria-label="Toggle captions"
            aria-pressed={
              isDesktopActive ? isDesktopCredit : isCreditOverlayVisible
            }
            onClick={handleToggleCaptions}
          >
            {(isDesktopActive ? isDesktopCredit : isCreditOverlayVisible) ? (
              <FaClosedCaptioning size={24} />
            ) : (
              <FaRegClosedCaptioning size={24} />
            )}
          </IconButton>
        </IconRow>

        <IconRow>
          <IconButton
            aria-label="Slower"
            onClick={sendMessage(REMOTE_CONTROLS.PLAYBACK_SLOWER.event)}
          >
            <LuTurtle size={30} />
          </IconButton>
          <IconButton
            aria-label="Faster"
            onClick={sendMessage(REMOTE_CONTROLS.PLAYBACK_FASTER.event)}
          >
            <LuRabbit size={30} />
          </IconButton>
        </IconRow>
      </RemoteControlRow>

      <ControlContainer>
        {ROW_1.map((control) => (
          <Button
            key={control.event}
            buttonType="tertiary"
            size="sm"
            fontSize="0.8rem"
            textTransform="none"
            onClick={sendMessage(control.event)}
          >
            {control.key +
              " " +
              t(`components.remote_control.${control.event}`)}
          </Button>
        ))}

        {/* Row 2 */}
        {ROW_2.map((control) => (
          <Button
            key={control.event}
            buttonType="tertiary"
            size="sm"
            fontSize="0.8rem"
            textTransform="none"
            onClick={sendMessage(control.event)}
          >
            {control.key +
              " " +
              t(`components.remote_control.${control.event}`)}
          </Button>
        ))}

        {/* Row 3 */}
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

        {/* Row 4 */}
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

        {/* Row 5 */}
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
      </ControlContainer>
    </RemoteControlContainer>
  );
};
