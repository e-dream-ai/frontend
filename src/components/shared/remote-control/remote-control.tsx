import React, { useEffect } from "react";
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
import { useWindowSize } from "@/hooks/useWindowSize";
import { DEVICES_ON_PX } from "@/constants/devices.constants";
import { ControlContainerDesktop } from "./control-container-desktop";
import { ControlContainerMobile } from "./control-container-mobile";

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

  const { width } = useWindowSize();
  const isDesktop = (width ?? 0) >= DEVICES_ON_PX.TABLET;

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
              isWebClientActive
                ? isCreditOverlayVisible
                : isDesktopActive
                  ? isDesktopCredit
                  : isCreditOverlayVisible
            }
            onClick={handleToggleCaptions}
          >
            {(
              isWebClientActive
                ? isCreditOverlayVisible
                : isDesktopActive
                  ? isDesktopCredit
                  : isCreditOverlayVisible
            ) ? (
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

      {isDesktop ? (
        <ControlContainerDesktop onSend={sendMessage} />
      ) : (
        <ControlContainerMobile onSend={sendMessage} />
      )}
    </RemoteControlContainer>
  );
};
