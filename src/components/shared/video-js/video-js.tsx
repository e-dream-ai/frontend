import { useVideoJs } from '@/hooks/useVideoJS';
import { FC, useEffect, useRef } from 'react';
import { Row, Column, Text } from '@/components/shared';
import { PlayerWrapper, VideoContainer, VideoWrapper } from './video-js.styled';
import { PoolConfig } from '@/constants/video-js.constants';
import { useWebClient } from '@/hooks/useWebClient';
import { PRELOAD_OPTION } from '@/constants/web-client.constants';
import 'video.js/dist/video-js.css';

type VideoJSProps = {
  //
}

/**
 * Renders and manages multiple video.js player instances. 
 * It works with the VideoJS Context to create a pool of video players, where each player is used to have smooth video transitions. 
 */
export const VideoJS: FC<VideoJSProps> = () => {
  const { players, videoWrapperRef, createPlayer, clearPlayers } = useVideoJs();
  const { isWebClientActive } = useWebClient();

  useEffect(() => {
    // creates min initial player slots
    for (let i = 0; i < PoolConfig.minPlayers; i++) {
      createPlayer();
    }

    return () => {
      // cleanup player instances
      clearPlayers();
    }
  }, [createPlayer, clearPlayers]);

  return (
    <Row style={{ display: isWebClientActive ? "flex" : "none" }}>
      <Column flex="auto">
        <Row>
          <Text mb="1rem" fontSize="1rem" fontWeight={600}>
            Web Client
          </Text>
        </Row>
        <VideoWrapper ref={videoWrapperRef}>
          {Array.from(players.values()).map(({ id, skipCrossfade, longTransition }) => (
            <PlayerSlot key={id} id={id} skipCrossfade={skipCrossfade} longTransition={longTransition} />
          ))}
        </VideoWrapper>
      </Column>
    </Row>
  );
};

const PlayerSlot = ({ id, skipCrossfade, longTransition }: { id: string, skipCrossfade: boolean, longTransition: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { activePlayer, registerPlayer, unregisterPlayer } = useVideoJs();

  const isActive = id === activePlayer;

  useEffect(() => {
    if (videoRef.current) {
      const options = {
        controls: true,
        fluid: true,
        preload: PRELOAD_OPTION,
        controlBar: {
          pictureInPictureToggle: false
        },
        html5: {
          noPictureInPicture: true
        }
      };

      const id = registerPlayer(videoRef.current, options);

      return () => {
        unregisterPlayer(id);
      };
    }
  }, [registerPlayer, unregisterPlayer]);

  return (
    <VideoContainer isActive={isActive} skipCrossfade={skipCrossfade} longTransition={longTransition}>
      <PlayerWrapper data-vjs-player>
        <video
          ref={videoRef}
          className={`video-js vjs-big-play-centered ${isActive ? "active" : "inactive"}`}
          data-player-id={id}
        />
      </PlayerWrapper>
    </VideoContainer >
  );
};
