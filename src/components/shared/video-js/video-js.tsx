import { useVideoJs } from "@/hooks/useVideoJS";
import { FC, memo, useEffect, useRef } from "react";
import { Row, Column, Text } from "@/components/shared";
import { PlayerWrapper, VideoContainer, VideoWrapper } from "./video-js.styled";
import { PoolConfig, VIDEOJS_OPTIONS } from "@/constants/video-js.constants";
import { useWebClient } from "@/hooks/useWebClient";
import "video.js/dist/video-js.css";

type VideoJSProps = {
  //
};

/**
 * Renders and manages multiple video.js player instances.
 * It works with the VideoJS Context to create a pool of video players, where each player is used to have smooth video transitions.
 */
export const VideoJS: FC<VideoJSProps> = () => {
  const { players, videoWrapperRef, activePlayer, createPlayer, clearPlayers } =
    useVideoJs();
  const { isWebClientActive } = useWebClient();

  useEffect(() => {
    // creates min initial player slots
    for (let i = 0; i < PoolConfig.minPlayers; i++) {
      createPlayer();
    }

    return () => {
      // cleanup player instances
      clearPlayers();
    };
  }, [createPlayer, clearPlayers]);

  return (
    <Row style={{ display: isWebClientActive ? "flex" : "none" }}>
      <Column flex="auto">
        <Row>
          <Text mb="1rem" fontSize="1rem" fontWeight={600}>
            Web Player
          </Text>
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

/**
 * Renders the video player element that contains videoRef to create videojs instance
 * Using `memo` helps avoid unnecesary rerenders, still rendering when parent does it
 */
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
            muted
          />
        </PlayerWrapper>
      </VideoContainer>
    );
  },
);
