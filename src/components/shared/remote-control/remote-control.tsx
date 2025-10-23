import React, { useEffect } from "react";
import {
  REMOTE_CONTROLS,
  NEW_REMOTE_CONTROL_EVENT,
} from "@/constants/remote-control.constants";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
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
import { TOOLTIP_DELAY_MS } from "@/constants/toast.constants";

export const RemoteControl: React.FC = () => {
  const { t } = useTranslation();
  const { emit } = useSocket();
  const { isWebClientActive, isCreditOverlayVisible } = useWebClient();
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWebClientActive, emit]);

  const { width } = useWindowSize();
  const isDesktop = (width ?? 0) >= DEVICES_ON_PX.TABLET;

  return (
    <RemoteControlContainer>
      <RemoteControlRow>
        <IconRow>
          <IconButton
            aria-label={t("actions.previous")}
            onClick={sendMessage(REMOTE_CONTROLS.GO_PREVIOUS_DREAM.event)}
            data-tooltip-id={isDesktop ? "remote-previous" : undefined}
          >
            <FaStepBackward size={24} />
          </IconButton>
          {isDesktop && (
            <Tooltip
              id="remote-previous"
              place="top"
              delayShow={TOOLTIP_DELAY_MS}
              content={t("actions.previous")}
            />
          )}

          <IconGroup>
            <IconButton
              aria-label={t("actions.like")}
              onClick={sendMessage(REMOTE_CONTROLS.LIKE_CURRENT_DREAM.event)}
              data-tooltip-id={isDesktop ? "remote-like" : undefined}
            >
              <FaThumbsUp size={24} />
            </IconButton>
            {isDesktop && (
              <Tooltip
                id="remote-like"
                place="top"
                delayShow={TOOLTIP_DELAY_MS}
                content={t("actions.like")}
              />
            )}
            <IconButton
              aria-label={t("actions.dislike")}
              onClick={sendMessage(REMOTE_CONTROLS.DISLIKE_CURRENT_DREAM.event)}
              data-tooltip-id={isDesktop ? "remote-dislike" : undefined}
            >
              <FaThumbsDown size={24} />
            </IconButton>
            {isDesktop && (
              <Tooltip
                id="remote-dislike"
                place="top"
                delayShow={TOOLTIP_DELAY_MS}
                content={t("actions.dislike")}
              />
            )}
          </IconGroup>

          <IconButton
            aria-label={t("actions.next")}
            onClick={sendMessage(REMOTE_CONTROLS.GO_NEXT_DREAM.event)}
            data-tooltip-id={isDesktop ? "remote-next" : undefined}
          >
            <FaStepForward size={24} />
          </IconButton>
          {isDesktop && (
            <Tooltip
              id="remote-next"
              place="top"
              delayShow={TOOLTIP_DELAY_MS}
              content={t("actions.next")}
            />
          )}
        </IconRow>

        <IconButton
          aria-label={
            (
              isWebClientActive
                ? isCreditOverlayVisible
                : isDesktopActive
                  ? isDesktopCredit
                  : isCreditOverlayVisible
            )
              ? t("actions.captions_off")
              : t("actions.captions_on")
          }
          aria-pressed={
            isWebClientActive
              ? isCreditOverlayVisible
              : isDesktopActive
                ? isDesktopCredit
                : isCreditOverlayVisible
          }
          onClick={handleToggleCaptions}
          data-tooltip-id={isDesktop ? "remote-captions" : undefined}
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
        {isDesktop && (
          <Tooltip
            id="remote-captions"
            place="top"
            delayShow={TOOLTIP_DELAY_MS}
            content={t("components.remote_control.credit")}
          />
        )}

        <IconRow>
          <IconButton
            aria-label={t("components.remote_control.playback_slower")}
            onClick={sendMessage(REMOTE_CONTROLS.PLAYBACK_SLOWER.event)}
            data-tooltip-id={isDesktop ? "remote-slower" : undefined}
          >
            <LuTurtle size={30} />
          </IconButton>
          {isDesktop && (
            <Tooltip
              id="remote-slower"
              place="top"
              delayShow={TOOLTIP_DELAY_MS}
              content={t("components.remote_control.playback_slower")}
            />
          )}
          <IconButton
            aria-label={t("components.remote_control.playback_faster")}
            onClick={sendMessage(REMOTE_CONTROLS.PLAYBACK_FASTER.event)}
            data-tooltip-id={isDesktop ? "remote-faster" : undefined}
          >
            <LuRabbit size={30} />
          </IconButton>
          {isDesktop && (
            <Tooltip
              id="remote-faster"
              place="top"
              delayShow={TOOLTIP_DELAY_MS}
              content={t("components.remote_control.playback_faster")}
            />
          )}
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
