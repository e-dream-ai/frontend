import { FC, memo, useEffect, useLayoutEffect, useRef } from 'react';
import { useBlocker } from 'react-router-dom';
import { useVideoJs } from '@/hooks/useVideoJS';
import { Row } from '@/components/shared';
import { PlayerWrapper, VideoContainer, VideoWrapper } from './video-js.styled';
import { PoolConfig, VIDEOJS_OPTIONS } from '@/constants/video-js.constants';
import { useWebClient } from '@/hooks/useWebClient';
import 'video.js/dist/video-js.css';

type VideoJSProps = {
  visible?: boolean;
}

/**
 * Renders and manages multiple video.js player instances. 
 * It works with the VideoJS Context to create a pool of video players, where each player is used to have smooth video transitions. 
 */
export const VideoJS: FC<VideoJSProps> = ({ visible = true }) => {
  const {
    players,
    videoWrapperRef,
    activePlayer,
    createPlayer,
    clearPlayers
  } = useVideoJs();
  const { isWebClientActive, setWebClientActive } = useWebClient();
  // Blocker used to block navigation until player instances are cleanup from the DOM
  const blocker = useBlocker(true);

  useEffect(() => {
    // creates min initial player slots
    for (let i = 0; i < PoolConfig.minPlayers; i++) {
      createPlayer();
    }
  }, [createPlayer, clearPlayers, setWebClientActive]);

  useEffect(() => {
    if (blocker.state === "blocked") {
      // Start cleanup when navigation is detected
      setWebClientActive(false);
      clearPlayers();
      // Allow navigation after cleanup
      blocker.proceed();
    }
  }, [blocker, setWebClientActive, clearPlayers]);

  return (
    <Row style={{ display: isWebClientActive && visible ? "flex" : "none" }}>
      <VideoWrapper ref={videoWrapperRef}>
        {
          players.map(({ id, skipCrossfade, longTransition }) => (
            <PlayerSlot
              key={id}
              id={id}
              isActive={id === activePlayer}
              skipCrossfade={skipCrossfade}
              longTransition={longTransition}
            />
          ))
        }
      </VideoWrapper>
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
    longTransition
  }: {
    id: string,
    isActive: boolean;
    skipCrossfade: boolean,
    longTransition: boolean
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { registerPlayer, unregisterPlayer } = useVideoJs();

    useLayoutEffect(() => {
      if (videoRef.current) {
        const id = registerPlayer(videoRef.current, VIDEOJS_OPTIONS);

        return () => {
          unregisterPlayer(id);
        };
      }
    }, [id, registerPlayer, unregisterPlayer]);

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
  }
);
