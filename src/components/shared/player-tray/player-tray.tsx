import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Row, Text } from "@/components/shared";
import { useTranslation } from "react-i18next";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaStepBackward,
  FaStepForward,
  FaClosedCaptioning,
} from "react-icons/fa";
import { LuTurtle, LuRabbit } from "react-icons/lu";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { PiRepeatBold } from "react-icons/pi";
import useAuth from "@/hooks/useAuth";
import { framesToSeconds, secondsToMinutes } from "@/utils/video.utils";
import { COLORS } from "@/constants/colors.constants";
import { DEVICES } from "@/constants/devices.constants";
import { useSocket } from "@/hooks/useSocket";
import { useWebClient } from "@/hooks/useWebClient";
import { usePlaybackMetrics } from "@/hooks/usePlaybackMetrics";
import {
  NEW_REMOTE_CONTROL_EVENT,
  REMOTE_CONTROLS,
} from "@/constants/remote-control.constants";
import { RemoteControlEvent } from "@/types/remote-control.types";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";

export const PlayerTray: React.FC = () => {
  const { t } = useTranslation();
  const { currentDream } = useAuth();
  const { emit } = useSocket();
  const { isWebClientActive, handlers, speedLevel } = useWebClient();
  const { currentTime, duration, fps } = usePlaybackMetrics();
  const navigate = useNavigate();

  const [desktopSpeedLevel, setDesktopSpeedLevel] = useState<number>(9);

  const [isHidden, setIsHidden] = useState<boolean>(() => {
    try {
      return (
        typeof window !== "undefined" &&
        window.localStorage.getItem("player-tray:hidden") === "1"
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("player-tray:hidden", isHidden ? "1" : "0");
    } catch (error) {
      console.error(error);
    }
  }, [isHidden]);

  const SPEED_EVENTS: readonly RemoteControlEvent[] = useMemo(
    () => [
      REMOTE_CONTROLS.PAUSE_1.event,
      REMOTE_CONTROLS.SET_SPEED_1.event,
      REMOTE_CONTROLS.SET_SPEED_2.event,
      REMOTE_CONTROLS.SET_SPEED_3.event,
      REMOTE_CONTROLS.SET_SPEED_4.event,
      REMOTE_CONTROLS.SET_SPEED_5.event,
      REMOTE_CONTROLS.SET_SPEED_6.event,
      REMOTE_CONTROLS.SET_SPEED_7.event,
      REMOTE_CONTROLS.SET_SPEED_8.event,
      REMOTE_CONTROLS.SET_SPEED_9.event,
    ],
    [],
  );

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
  const computedDreamSeconds = framesToSeconds(
    currentDream?.processedVideoFrames ?? 0,
    currentDream?.activityLevel ?? 0,
  );
  const elapsedFormatted = secondsToMinutes(
    Math.max(0, Math.floor(currentTime)),
  );
  const totalFormatted = secondsToMinutes(
    Math.max(0, Math.floor(duration || computedDreamSeconds)),
  );

  if (isHidden) {
    return (
      <TrayReopenButton
        aria-label={t("actions.open")}
        onClick={() => setIsHidden(false)}
      >
        <FaChevronUp size={16} color={COLORS.WHITE} />
        {t("remote_control.player_tray")}
      </TrayReopenButton>
    );
  }

  return (
    <TrayContainer
      role="contentinfo"
      aria-label={t("remote_control.player_tray")}
    >
      <LeftSection>
        <Artwork src={thumbnail} alt={title} />
        <TrackInfo>
          <TrackTitle onClick={() => navigate(ROUTES.REMOTE_CONTROL)}>
            {title}
          </TrackTitle>
          <TrackMeta>{artist}</TrackMeta>
        </TrackInfo>
        <TrackInfo>
          <Duration>{elapsedFormatted}</Duration>
          <Duration>{totalFormatted}</Duration>
        </TrackInfo>
      </LeftSection>

      <CenterRightRow>
        <CenterSection>
          <PlayerControls
            t={t}
            onPrevious={() =>
              sendMessage(REMOTE_CONTROLS.GO_PREVIOUS_DREAM.event)
            }
            onNext={() => sendMessage(REMOTE_CONTROLS.GO_NEXT_DREAM.event)}
            onLike={() => sendMessage(REMOTE_CONTROLS.LIKE_CURRENT_DREAM.event)}
            onDislike={() =>
              sendMessage(REMOTE_CONTROLS.DISLIKE_CURRENT_DREAM.event)
            }
          />
          <SideControls
            t={t}
            onRepeat={() => sendMessage(REMOTE_CONTROLS.PAUSE_2.event)}
            onCc={() => sendMessage(REMOTE_CONTROLS.CREDIT.event)}
          />
        </CenterSection>

        <RightSection>
          <ColumnControls>
            <SpeedControl
              speed={isWebClientActive ? speedLevel : desktopSpeedLevel}
              fps={fps}
              onChange={(value) => {
                if (isWebClientActive) {
                  const wasZero = speedLevel === 0;
                  if (wasZero && value > 0) {
                    sendMessage(REMOTE_CONTROLS.PAUSE_1.event);
                  }
                  const event = SPEED_EVENTS[value] as RemoteControlEvent;
                  sendMessage(event);
                  return;
                }

                const wasZero = desktopSpeedLevel === 0;
                if (wasZero && value > 0) {
                  sendMessage(REMOTE_CONTROLS.PAUSE_1.event);
                }
                setDesktopSpeedLevel(value);
                const event = SPEED_EVENTS[value] as RemoteControlEvent;
                sendMessage(event);
              }}
            />
          </ColumnControls>
        </RightSection>
      </CenterRightRow>
      <CloseButton
        aria-label={t("actions.hide")}
        onClick={() => setIsHidden(true)}
      >
        <FaChevronDown size={20} color={COLORS.WHITE} />
      </CloseButton>
    </TrayContainer>
  );
};

interface PlayerControlsProps {
  t: (key: string) => string;
  onPrevious: () => void;
  onNext: () => void;
  onLike: () => void;
  onDislike: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  t,
  onPrevious,
  onNext,
  onLike,
  onDislike,
}) => (
  <ControlsGroup>
    <IconButton aria-label={t("actions.previous")} onClick={onPrevious}>
      <FaStepBackward size={24} color={COLORS.WHITE} />
    </IconButton>

    <ColumnControls>
      <IconButton aria-label={t("actions.like")} onClick={onLike}>
        <FaThumbsUp size={24} color={COLORS.WHITE} />
      </IconButton>
      <IconButton aria-label={t("actions.dislike")} onClick={onDislike}>
        <FaThumbsDown size={24} color={COLORS.WHITE} />
      </IconButton>
    </ColumnControls>

    <IconButton aria-label={t("actions.next")} onClick={onNext}>
      <FaStepForward size={24} color={COLORS.WHITE} />
    </IconButton>
  </ControlsGroup>
);

interface SideControlsProps {
  t: (key: string) => string;
  onRepeat: () => void;
  onCc: () => void;
}

const SideControls: React.FC<SideControlsProps> = ({ t, onRepeat, onCc }) => (
  <ColumnControls>
    <IconButton aria-label={t("actions.repeat")} onClick={onRepeat}>
      <PiRepeatBold size={24} color={COLORS.WHITE} />
    </IconButton>
    <IconButton aria-label="CC" onClick={onCc}>
      <FaClosedCaptioning size={24} color={COLORS.WHITE} />
    </IconButton>
  </ColumnControls>
);

interface SpeedControlProps {
  speed: number;
  fps: number;
  onChange: (value: number) => void;
}

const SpeedControl: React.FC<SpeedControlProps> = ({
  speed,
  fps,
  onChange,
}) => {
  const handleSlower = () => {
    const newSpeed = Math.max(0, speed - 1);
    onChange(newSpeed);
  };

  const handleFaster = () => {
    const newSpeed = Math.min(9, speed + 1);
    onChange(newSpeed);
  };

  return (
    <SpeedWrapper>
      <IconButton aria-label="Slower speed" onClick={handleSlower}>
        <LuTurtle size={24} color={COLORS.WHITE} />
      </IconButton>

      <FpsText>{fps} fps</FpsText>

      <IconButton aria-label="Faster speed" onClick={handleFaster}>
        <LuRabbit size={24} color={COLORS.WHITE} />
      </IconButton>
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
  border-top: 1px solid ${(p) => p.theme.colorBackgroundSecondary};
  padding: 1rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: ${DEVICES.TABLET}) {
    justify-content: center;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1 1 320px;
  min-width: 0;
`;

const CenterSection = styled(Row)`
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex: 1 1 320px;
  margin: 0;
  min-width: 0;

  @media (max-width: 1036px) {
    flex: 1 1 160px;
    justify-content: flex-end;
  }

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

const RightSection = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 1 1 320px;
  min-width: 0;

  @media (max-width: 1036px) {
    flex: 1 1 160px;
    justify-content: flex-start;
  }

  @media (max-width: 768px) {
    justify-content: flex-end;
  }
`;

const CenterRightRow = styled.div`
  display: flex;
  flex: 2 1 640px;
  gap: 1rem;
  min-width: 0;
  align-items: center;
`;

const Artwork = styled.img`
  width: 96px;
  height: 54px;
  object-fit: cover;
  border-radius: 2px;
  background: ${(p) => p.theme.colorBackgroundQuaternary};
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
`;

const Duration = styled(Text)`
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  opacity: 0.8;
`;

const SpeedWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const FpsText = styled(Text)`
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  text-wrap: nowrap;
`;

const IconButton = styled.button`
  background: transparent;
  border: 0;
  padding: 0.25rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  :hover {
    opacity: 0.8;
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
  top: -32.5px;
  background: #000;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

export default PlayerTray;
