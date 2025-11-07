import { useVideoJs } from "@/hooks/useVideoJS";
import { FC, memo, useEffect, useRef } from "react";
import { Row, Column, Text, Button } from "@/components/shared";
import { PlayerWrapper, VideoContainer, VideoWrapper } from "./video-js.styled";
import { PoolConfig, VIDEOJS_OPTIONS } from "@/constants/video-js.constants";
import { useWebClient } from "@/hooks/useWebClient";
import "video.js/dist/video-js.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

type VideoJSProps = {};

export const VideoJS: FC<VideoJSProps> = () => {
  const { players, videoWrapperRef, activePlayer, createPlayer, clearPlayers } =
    useVideoJs();
  const { isWebClientActive, setWebClientActive } = useWebClient();

  useEffect(() => {
    for (let i = 0; i < PoolConfig.minPlayers; i++) {
      createPlayer();
    }

    return () => {
      clearPlayers();
    };
  }, [createPlayer, clearPlayers]);

  return (
    <Row style={{ display: isWebClientActive ? "flex" : "none" }}>
      <Column flex="auto">
        <Row justifyContent="space-between" alignItems={"center"} mb="1rem">
          <Text fontSize="1rem" fontWeight={600}>
            Web Player
          </Text>
          <Button
            type="button"
            buttonType="danger"
            size="md"
            transparent
            onClick={() => setWebClientActive(false)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </Row>

        <VideoWrapper ref={videoWrapperRef}>
          {players.map(({ id, skipCrossfade, longTransition }) => (
            <PlayerSlot
              key={id}
              id={id}
              isActive={id === activePlayer}
              skipCrossfade={skipCrossfade}
              longTransition={longTransition}
            />
          ))}
        </VideoWrapper>
      </Column>
    </Row>
  );
};

const PlayerSlot = memo(
  ({
    id,
    isActive,
    skipCrossfade,
    longTransition,
  }: {
    id: string;
    isActive: boolean;
    skipCrossfade: boolean;
    longTransition: boolean;
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { registerPlayer, unregisterPlayer } = useVideoJs();

    useEffect(() => {
      if (videoRef.current) {
        const id = registerPlayer(videoRef.current, VIDEOJS_OPTIONS);

        return () => {
          unregisterPlayer(id);
        };
      }
    }, [id, registerPlayer, unregisterPlayer]);

    return (
      <VideoContainer
        isActive={isActive}
        skipCrossfade={skipCrossfade}
        longTransition={longTransition}
      >
        <PlayerWrapper data-vjs-player>
          <video
            ref={videoRef}
            className={`video-js vjs-big-play-centered ${
              isActive ? "active" : "inactive"
            }`}
            data-player-id={id}
            playsInline
            webkit-playsinline="true"
            muted
          />
        </PlayerWrapper>
      </VideoContainer>
    );
  },
);
