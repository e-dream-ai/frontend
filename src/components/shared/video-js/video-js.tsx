import { useVideoJs } from '@/hooks/useVideoJS';
import { FC, useEffect, useRef } from 'react';
import { Row, Column, Text } from '@/components/shared';
import 'video.js/dist/video-js.css';
import { PlayerWrapper, VideoContainer, VideoWrapper } from './video-js.styled';
import { PoolConfig } from '@/constants/video-js.constants';

type VideoJSProps = {
  //
}

export const VideoJS: FC<VideoJSProps> = () => {
  const { players, createPlayer } = useVideoJs();
  
  useEffect(() => {
    // creates min initial player slots
    for (let i = 0; i < PoolConfig.minPlayers; i++) {
      createPlayer();
    }
  }, [createPlayer]);

  return (
    <Row>
      <Column flex="auto">
        <Row>
          <Text mb="1rem" fontSize="1rem" fontWeight={600}>
            Web Client
          </Text>
        </Row>
        <VideoWrapper>
          {Array.from(players.values()).map(({ id }) => (
            <PlayerSlot key={id} id={id} />
          ))}
        </VideoWrapper>
      </Column>
    </Row>
  );
};

const PlayerSlot = ({ id }: { id: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { activePlayer, registerPlayer, unregisterPlayer } = useVideoJs();

  useEffect(() => {
    if (videoRef.current) {
      const options = {
        controls: true,
        fluid: true,
        preload: "auto"
      };

      const id = registerPlayer(videoRef.current, options);

      return () => {
        unregisterPlayer(id);
      };
    }
  }, [registerPlayer, unregisterPlayer]);

  return (
    <VideoContainer isActive={id === activePlayer}>
      <PlayerWrapper data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          data-player-id={id}
        />
      </PlayerWrapper>
    </VideoContainer>
  );
};
