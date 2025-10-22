import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Row, Text } from "@/components/shared";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaStepBackward,
  FaStepForward,
  FaRegClosedCaptioning,
  FaClosedCaptioning,
} from "react-icons/fa";
import { LuTurtle, LuRabbit } from "react-icons/lu";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import useAuth from "@/hooks/useAuth";
import { usePlaybackStore } from "@/stores/playback.store";
import { DEVICES } from "@/constants/devices.constants";
import { useSocket } from "@/hooks/useSocket";
import { useWebClient } from "@/hooks/useWebClient";
import { useDesktopClient } from "@/hooks/useDesktopClient";
import { useVideoJs } from "@/hooks/useVideoJS";
import {
  NEW_REMOTE_CONTROL_EVENT,
  REMOTE_CONTROLS,
} from "@/constants/remote-control.constants";
import { RemoteControlEvent } from "@/types/remote-control.types";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import { TOOLTIP_DELAY_MS } from "@/constants/toast.constants";
import { useWindowSize } from "@/hooks/useWindowSize";
import { DEVICES_ON_PX } from "@/constants/devices.constants";

export const PlayerTray: React.FC = () => {
  const { t } = useTranslation();
  const { currentDream: authCurrentDream, isLoadingCurrentDream: authLoading } =
    useAuth();
  const currentDream =
    usePlaybackStore((s) => s.currentDream) ?? authCurrentDream;
  const isLoadingCurrentDream =
    usePlaybackStore((s) => s.isLoadingCurrentDream) || authLoading;
  const { emit } = useSocket();
  const { isWebClientActive, handlers, isCreditOverlayVisible } =
    useWebClient();
  const {
    isActive: isDesktopActive,
    isCreditOverlayVisible: isDesktopCreditVisible,
  } = useDesktopClient();
  const { isReady: isVideoReady } = useVideoJs();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const isDesktop = (width ?? 0) >= DEVICES_ON_PX.TABLET;

  const [isHidden, setIsHidden] = useState<boolean>(false);

  const navigateToRemoteControl = (): void => {
    navigate(ROUTES.REMOTE_CONTROL);
  };

  const sendMessage = (event: RemoteControlEvent) => {
    emit(NEW_REMOTE_CONTROL_EVENT, {
      event,
      isWebClientEvent: isWebClientActive,
    });
    if (isWebClientActive) {
      handlers?.[event]?.();
    }
  };

  const title = currentDream?.name ?? t("components.current_dream.title");
  const artist = currentDream?.user?.name ?? t("common.unknown_author");
  const thumbnail = currentDream?.thumbnail;

  if (!isDesktopActive || isVideoReady) {
    return null;
  }

  if (isHidden) {
    return (
      <TrayReopenButton
        aria-label={t("actions.open")}
        onClick={() => setIsHidden(false)}
      >
        <FaChevronUp size={16} />
        {t("remote_control.player_tray")}
      </TrayReopenButton>
    );
  }

  return (
    <TrayContainer
      role="contentinfo"
      aria-label={t("remote_control.player_tray")}
    >
      <Content>
        <LeftSection>
          {isLoadingCurrentDream ? (
            <>
              <SkeletonArtwork aria-label={t("common.loading")} />
              <TrackInfo>
                <SkeletonTitle />
                <SkeletonMeta />
              </TrackInfo>
            </>
          ) : (
            <>
              <Artwork
                key={`${currentDream?.id ?? ""}-${
                  currentDream?.updated_at ?? ""
                }`}
                src={thumbnail}
                alt={title}
                onClick={navigateToRemoteControl}
              />
              <TrackInfo>
                <TrackTitle onClick={navigateToRemoteControl}>
                  {title}
                </TrackTitle>
                <TrackMeta onClick={navigateToRemoteControl}>
                  {artist}
                </TrackMeta>
              </TrackInfo>
            </>
          )}
        </LeftSection>

        <CenterRightRow>
          <CenterSection>
            <PlayerControls
              t={t}
              onPrevious={() =>
                sendMessage(REMOTE_CONTROLS.GO_PREVIOUS_DREAM.event)
              }
              onNext={() => sendMessage(REMOTE_CONTROLS.GO_NEXT_DREAM.event)}
              onLike={() =>
                sendMessage(REMOTE_CONTROLS.LIKE_CURRENT_DREAM.event)
              }
              onDislike={() =>
                sendMessage(REMOTE_CONTROLS.DISLIKE_CURRENT_DREAM.event)
              }
              enableTooltips={isDesktop}
            />
          </CenterSection>

          <SideControls
            isOn={
              isWebClientActive
                ? isCreditOverlayVisible
                : isDesktopActive
                  ? isDesktopCreditVisible
                  : isCreditOverlayVisible
            }
            onToggle={() => {
              sendMessage(REMOTE_CONTROLS.CREDIT.event);
            }}
            idSuffix="mobile"
            enableTooltips={isDesktop}
          />

          <RightSection>
            <ColumnControls>
              <SpeedControl
                onSlower={() =>
                  sendMessage(REMOTE_CONTROLS.PLAYBACK_SLOWER.event)
                }
                onFaster={() =>
                  sendMessage(REMOTE_CONTROLS.PLAYBACK_FASTER.event)
                }
                enableTooltips={isDesktop}
              />
            </ColumnControls>
          </RightSection>
        </CenterRightRow>
        <CloseButton
          aria-label={t("actions.hide")}
          onClick={() => setIsHidden(true)}
          data-tooltip-id="player-tray-hide"
        >
          <FaChevronDown size={20} color="#fff" />
        </CloseButton>
        <Tooltip
          id="player-tray-hide"
          place="top"
          delayShow={TOOLTIP_DELAY_MS}
          content={t("actions.hide")}
        />
      </Content>
    </TrayContainer>
  );
};

interface PlayerControlsProps {
  t: (key: string) => string;
  onPrevious: () => void;
  onNext: () => void;
  onLike: () => void;
  onDislike: () => void;
  enableTooltips?: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  t,
  onPrevious,
  onNext,
  onLike,
  onDislike,
  enableTooltips,
}) => (
  <ControlsGroup>
    <IconButton
      aria-label={t("actions.previous")}
      onClick={onPrevious}
      data-tooltip-id={enableTooltips ? "player-tray-previous" : undefined}
    >
      <FaStepBackward size={24} />
    </IconButton>
    {enableTooltips && (
      <Tooltip
        id="player-tray-previous"
        place="top"
        delayShow={TOOLTIP_DELAY_MS}
        content={t("actions.previous")}
      />
    )}

    <ColumnControls>
      <IconButton
        aria-label={t("actions.like")}
        onClick={onLike}
        data-tooltip-id={enableTooltips ? "player-tray-like" : undefined}
      >
        <FaThumbsUp size={24} />
      </IconButton>
      {enableTooltips && (
        <Tooltip
          id="player-tray-like"
          place="top"
          delayShow={TOOLTIP_DELAY_MS}
          content={t("actions.like")}
        />
      )}
      <IconButton
        aria-label={t("actions.dislike")}
        onClick={onDislike}
        data-tooltip-id={enableTooltips ? "player-tray-dislike" : undefined}
      >
        <FaThumbsDown size={24} />
      </IconButton>
      {enableTooltips && (
        <Tooltip
          id="player-tray-dislike"
          place="top"
          delayShow={TOOLTIP_DELAY_MS}
          content={t("actions.dislike")}
        />
      )}
    </ColumnControls>

    <IconButton
      aria-label={t("actions.next")}
      onClick={onNext}
      data-tooltip-id={enableTooltips ? "player-tray-next" : undefined}
    >
      <FaStepForward size={24} />
    </IconButton>
    {enableTooltips && (
      <Tooltip
        id="player-tray-next"
        place="top"
        delayShow={TOOLTIP_DELAY_MS}
        content={t("actions.next")}
      />
    )}
  </ControlsGroup>
);

interface SideControlsProps {
  isOn: boolean;
  onToggle: () => void;
  idSuffix?: string;
  enableTooltips?: boolean;
}

const SideControls: React.FC<SideControlsProps> = ({
  isOn,
  onToggle,
  idSuffix,
  enableTooltips,
}) => {
  const { t } = useTranslation();
  const tooltipId = `player-tray-credit-${idSuffix ?? "default"}`;
  return (
    <ColumnControls>
      <IconButton
        aria-label={isOn ? t("actions.captions_off") : t("actions.captions_on")}
        aria-pressed={isOn}
        onClick={onToggle}
        data-tooltip-id={enableTooltips ? tooltipId : undefined}
      >
        {isOn ? (
          <FaClosedCaptioning size={24} />
        ) : (
          <FaRegClosedCaptioning size={24} />
        )}
      </IconButton>
      {enableTooltips && (
        <Tooltip
          id={tooltipId}
          place="top"
          delayShow={TOOLTIP_DELAY_MS}
          content={t("components.remote_control.credit")}
        />
      )}
    </ColumnControls>
  );
};

interface SpeedControlProps {
  onSlower: () => void;
  onFaster: () => void;
  enableTooltips?: boolean;
}

const SpeedControl: React.FC<SpeedControlProps> = ({
  onSlower,
  onFaster,
  enableTooltips,
}) => {
  const { t } = useTranslation();
  const handleSlower = () => {
    onSlower();
  };
  const handleFaster = () => {
    onFaster();
  };
  return (
    <SpeedWrapper>
      <IconButton
        aria-label={t("components.remote_control.playback_slower")}
        onClick={handleSlower}
        data-tooltip-id={enableTooltips ? "player-tray-slower" : undefined}
      >
        <LuTurtle size={30} />
      </IconButton>
      {enableTooltips && (
        <Tooltip
          id="player-tray-slower"
          place="top"
          delayShow={TOOLTIP_DELAY_MS}
          content={t("components.remote_control.playback_slower")}
        />
      )}
      <IconButton
        aria-label={t("components.remote_control.playback_faster")}
        onClick={handleFaster}
        data-tooltip-id={enableTooltips ? "player-tray-faster" : undefined}
      >
        <LuRabbit size={30} />
      </IconButton>
      {enableTooltips && (
        <Tooltip
          id="player-tray-faster"
          place="top"
          delayShow={TOOLTIP_DELAY_MS}
          content={t("components.remote_control.playback_faster")}
        />
      )}
    </SpeedWrapper>
  );
};

const TrayContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: #000;
  border-top: 3px solid ${(p) => p.theme.colorBackgroundSecondary};
  padding: 1rem 2.5rem;

  @media (max-width: ${DEVICES.MOBILE_S}) {
    justify-content: center;
    padding: 1rem 1.25rem;
  }
`;

const Content = styled.div`
  display: flex;
  max-width: 1024px;
  width: 100%;
  margin: 0 auto;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-width: 0;
  max-width: 50%;

  @media (max-width: ${DEVICES.MOBILE_S}) {
    max-width: 100%;
  }
`;

const CenterSection = styled(Row)`
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 0;
  min-width: 0;

  @media (max-width: ${DEVICES.MOBILE_S}) {
    justify-content: flex-start;
  }
`;

const RightSection = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-width: 0;

  @media (max-width: 1036px) {
    justify-content: flex-start;
  }

  @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;

const CenterRightRow = styled.div`
  display: flex;
  gap: 3.5em;
  min-width: 0;
  align-items: center;

  @media (max-width: ${DEVICES.MOBILE_S}) {
    justify-content: space-between;
    width: 100%;
  }
`;

const Artwork = styled.img`
  width: 96px;
  height: 54px;
  object-fit: cover;
  border-radius: 2px;
  background: ${(p) => p.theme.colorBackgroundQuaternary};
  cursor: pointer;
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`;

const SkeletonBase = styled.div`
  background: ${(p) => p.theme.colorBackgroundQuaternary};
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0px,
    rgba(255, 255, 255, 0.08) 40px,
    rgba(255, 255, 255, 0) 80px
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.2s ease-in-out infinite;
  border-radius: 4px;
`;

const SkeletonArtwork = styled(SkeletonBase)`
  width: 96px;
  height: 54px;
  border-radius: 2px;
`;

const SkeletonTitle = styled(SkeletonBase)`
  width: 160px;
  height: 20px;
`;

const SkeletonMeta = styled(SkeletonBase)`
  width: 120px;
  height: 16px;
  margin-top: 6px;
`;

const TrackInfo = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const TrackTitle = styled(Text)`
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  display: block;
  max-width: 100%;

  :hover {
    opacity: 0.8;
  }
`;

const TrackMeta = styled(Text)`
  font-size: 1rem;
  color: #fff;
  opacity: 0.8;
  cursor: pointer;

  :hover {
    opacity: 1;
  }
`;

const SpeedWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const IconButton = styled.button`
  background: transparent;
  border: 0;
  padding: 0.25rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease-in-out;
  color: rgb(252, 217, 183);

  :hover {
    color: rgb(0, 208, 219);
  }
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ColumnControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const TrayReopenButton = styled.button`
  position: fixed;
  right: 12px;
  bottom: 12px;
  z-index: 1000;
  background: #000;
  color: #fff;
  border: 1px solid #333;
  border-radius: 9999px;
  padding: 0.5rem 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  :hover {
    opacity: 0.9;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: 16px;
  top: -31.5px;
  background: transparent;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
`;

export default PlayerTray;
