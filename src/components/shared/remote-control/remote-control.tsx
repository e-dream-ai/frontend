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
  LeftSection,
  Artwork,
  TrackInfo,
  TrackInfoRow,
  TrackInfoLeft,
  TrackInfoRight,
  TrackTitle,
  TrackMeta,
  TimecodeText,
  FpsText,
  SkeletonArtwork,
  SkeletonTitle,
  SkeletonMeta,
  DreamArtworkLink,
  DreamInfoLink,
} from "./remote-control.styled";
import { onNewRemoteControlEvent } from "@/utils/socket.util";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import {
  RemoteControlEvent,
  RemoteControlEventData,
} from "@/types/remote-control.types";
import { useWebClient } from "@/hooks/useWebClient";
import { useDesktopClient } from "@/hooks/useDesktopClient";
import { usePlaybackMetrics } from "@/hooks/usePlaybackMetrics";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaStepBackward,
  FaStepForward,
  FaRegClosedCaptioning,
  FaClosedCaptioning,
} from "react-icons/fa";
import { LuTurtle, LuRabbit, LuSnail } from "react-icons/lu";
import RepeatIcon from "@/icons/repeat-icon";
import ShuffleIcon from "@/icons/shuffle-icon";
import FlyingBird from "@/icons/flying-bird";
import { useWindowSize } from "@/hooks/useWindowSize";
import { DEVICES_ON_PX } from "@/constants/devices.constants";
import { ControlContainerDesktop } from "./control-container-desktop";
import { ControlContainerMobile } from "./control-container-mobile";
import { TOOLTIP_DELAY_MS } from "@/constants/toast.constants";
import useAuth from "@/hooks/useAuth";
import { usePlaybackStore } from "@/stores/playback.store";
import { ROUTES } from "@/constants/routes.constants";

const formatTimecode = (s: number): string => {
  if (!Number.isFinite(s) || s < 0) return "--:--.--";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const p = (n: number) => n.toString().padStart(2, "0");
  const secInt = Math.floor(sec);
  const centiseconds = Math.floor((sec % 1) * 100);
  return `${p(m)}:${p(secInt)}.${p(centiseconds)}`;
};

export const RemoteControl: React.FC = () => {
  const { t } = useTranslation();
  const { emit, connectedDevicesCount, hasWebPlayer } = useSocket();
  const {
    user,
    currentDream: authCurrentDream,
    isLoadingCurrentDream: authLoading,
    refreshCurrentDream,
  } = useAuth();
  const storeDream = usePlaybackStore((s) => s.currentDream);
  const storeIsLoading = usePlaybackStore((s) => s.isLoadingCurrentDream);
  const currentDream = storeDream ?? authCurrentDream;
  const isLoadingCurrentDream = storeIsLoading || authLoading;
  const {
    isWebClientActive,
    isCreditOverlayVisible,
    isRepeatMode: webRepeatMode,
    isShuffleMode: webShuffleMode,
  } = useWebClient();
  const {
    isActive: isDesktopActive,
    isCreditOverlayVisible: isDesktopCredit,
    currentTime,
    fps,
    isRepeatMode: desktopRepeatMode,
    isShuffleMode: desktopShuffleMode,
  } = useDesktopClient();
  const { fps: playbackFps } = usePlaybackMetrics();

  const isAnyClientActive =
    isDesktopActive ||
    ((connectedDevicesCount ?? 0) > 1 && !!hasWebPlayer) ||
    isWebClientActive;

  const handleRemoteControlEvent = onNewRemoteControlEvent(t);

  useSocketEventListener<RemoteControlEventData>(
    NEW_REMOTE_CONTROL_EVENT,
    handleRemoteControlEvent,
  );

  useEffect(() => {
    if (user && !authCurrentDream && !authLoading && refreshCurrentDream) {
      void refreshCurrentDream();
    }
  }, [user, authCurrentDream, authLoading, refreshCurrentDream]);

  const title = currentDream?.name ?? t("components.current_dream.title");
  const artist = currentDream?.user?.name ?? t("common.unknown_author");
  const thumbnail = currentDream?.thumbnail;
  const currentDreamRoute = currentDream?.uuid
    ? `${ROUTES.VIEW_DREAM}/${currentDream.uuid}`
    : undefined;

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
      if (eventName && isAnyClientActive) {
        event.preventDefault();
        emit(NEW_REMOTE_CONTROL_EVENT, {
          event: eventName,
          isWebClientEvent: isWebClientActive,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWebClientActive, emit, isAnyClientActive]);

  const { width } = useWindowSize();
  const isDesktop = (width ?? 0) >= DEVICES_ON_PX.TABLET;

  const repeatActive = isWebClientActive
    ? webRepeatMode
    : isDesktopActive
      ? desktopRepeatMode
      : webRepeatMode;
  const shuffleActive = isWebClientActive
    ? webShuffleMode
    : isDesktopActive
      ? desktopShuffleMode
      : webShuffleMode;
  const isHighFps = playbackFps > 32;
  const isLowFps = playbackFps > 0 && playbackFps < 1.5;
  const slowerIcon = isHighFps ? (
    <LuRabbit size={30} />
  ) : isLowFps ? (
    <LuSnail size={30} />
  ) : (
    <LuTurtle size={30} />
  );
  const fasterIcon = isHighFps ? (
    <FlyingBird width={30} height={30} />
  ) : isLowFps ? (
    <LuTurtle size={30} />
  ) : (
    <LuRabbit size={30} />
  );

  return (
    <RemoteControlContainer>
      <LeftSection>
        {isLoadingCurrentDream && !currentDream ? (
          <>
            <SkeletonArtwork aria-label={t("common.loading")} />
            <TrackInfo>
              <SkeletonTitle />
              <SkeletonMeta />
            </TrackInfo>
          </>
        ) : (
          <>
            {currentDreamRoute ? (
              <DreamArtworkLink to={currentDreamRoute}>
                <Artwork
                  key={`${currentDream?.id ?? ""}-${
                    currentDream?.updated_at ?? ""
                  }`}
                  src={thumbnail}
                  alt={title}
                />
              </DreamArtworkLink>
            ) : (
              <Artwork
                key={`${currentDream?.id ?? ""}-${
                  currentDream?.updated_at ?? ""
                }`}
                src={thumbnail}
                alt={title}
              />
            )}
            <TrackInfo>
              <TrackInfoRow>
                <TrackInfoLeft>
                  {currentDreamRoute ? (
                    <DreamInfoLink to={currentDreamRoute}>
                      <TrackTitle>{title}</TrackTitle>
                      <TrackMeta>{artist}</TrackMeta>
                    </DreamInfoLink>
                  ) : (
                    <>
                      <TrackTitle>{title}</TrackTitle>
                      <TrackMeta>{artist}</TrackMeta>
                    </>
                  )}
                </TrackInfoLeft>
                {isDesktopActive && (
                  <TrackInfoRight>
                    <TimecodeText>{formatTimecode(currentTime)}</TimecodeText>
                    <FpsText>
                      {fps > 0 ? `${fps.toFixed(2)} fps` : "--"}
                    </FpsText>
                  </TrackInfoRight>
                )}
              </TrackInfoRow>
            </TrackInfo>
          </>
        )}
      </LeftSection>

      <RemoteControlRow>
        <IconRow>
          <IconButton
            aria-label={t("actions.previous")}
            onClick={sendMessage(REMOTE_CONTROLS.GO_PREVIOUS_DREAM.event)}
            data-tooltip-id={isDesktop ? "remote-previous" : undefined}
            disabled={!isAnyClientActive}
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
              disabled={!isAnyClientActive}
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
              disabled={!isAnyClientActive}
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
            disabled={!isAnyClientActive}
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

        <IconGroup style={{ flexDirection: "row", gap: "0.3em" }}>
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
            disabled={!isAnyClientActive}
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

          <IconButton
            aria-label={t("components.remote_control.repeat")}
            aria-pressed={repeatActive}
            onClick={sendMessage(REMOTE_CONTROLS.TOGGLE_REPEAT.event)}
            data-tooltip-id={isDesktop ? "remote-repeat" : undefined}
            disabled={!isAnyClientActive}
          >
            <RepeatIcon
              variant={repeatActive ? "filled" : "outline"}
              size={24}
            />
          </IconButton>
          {isDesktop && (
            <Tooltip
              id="remote-repeat"
              place="top"
              delayShow={TOOLTIP_DELAY_MS}
              content={t("components.remote_control.repeat")}
            />
          )}

          <IconButton
            aria-label={t("components.remote_control.shuffle")}
            aria-pressed={shuffleActive}
            onClick={sendMessage(REMOTE_CONTROLS.TOGGLE_SHUFFLE.event)}
            data-tooltip-id={isDesktop ? "remote-shuffle" : undefined}
            disabled={!isAnyClientActive}
          >
            <ShuffleIcon
              variant={shuffleActive ? "filled" : "outline"}
              size={24}
            />
          </IconButton>
          {isDesktop && (
            <Tooltip
              id="remote-shuffle"
              place="top"
              delayShow={TOOLTIP_DELAY_MS}
              content={t("components.remote_control.shuffle")}
            />
          )}
        </IconGroup>

        <IconRow>
          <IconButton
            aria-label={t("components.remote_control.playback_slower")}
            onClick={sendMessage(REMOTE_CONTROLS.PLAYBACK_SLOWER.event)}
            data-tooltip-id={isDesktop ? "remote-slower" : undefined}
            disabled={!isAnyClientActive}
          >
            {slowerIcon}
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
            disabled={!isAnyClientActive}
          >
            {fasterIcon}
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
        <ControlContainerDesktop
          onSend={sendMessage}
          disabled={!isAnyClientActive}
        />
      ) : (
        <ControlContainerMobile
          onSend={sendMessage}
          disabled={!isAnyClientActive}
        />
      )}
    </RemoteControlContainer>
  );
};
