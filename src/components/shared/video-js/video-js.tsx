import { useVideoJs } from '@/hooks/useVideoJS';
import { FC, useEffect, useRef } from 'react';
import { Row, Column, Text } from '@/components/shared';
import 'video.js/dist/video-js.css';
import { PlayerWrapper, VideoContainer, VideoWrapper } from './video-js.styled';

type VideoJSProps = {
  //
}

export const VideoJS: FC<VideoJSProps> = () => {
  const videoOneRef = useRef<HTMLVideoElement>(null);
  const videoTwoRef = useRef<HTMLVideoElement>(null);
  const { activePlayer, initializePlayer, destroyPlayer } = useVideoJs();

  useEffect(() => {
    if (!videoOneRef.current || !videoTwoRef.current) return;

    initializePlayer({
      videoOneElement: videoOneRef.current,
      videoTwoElement: videoTwoRef.current,
      options: {
        // controls: true,
        fluid: true,
        preload: "auto"
      },
    });

    return () => {
      destroyPlayer();
    };
  }, [initializePlayer, destroyPlayer]);

  return (
    <Row>
      <Column flex="auto">
        <Row>
          <Text mb="1rem" fontSize="1rem" fontWeight={600}>
            Web Client
          </Text>
        </Row>
        <VideoWrapper>
          <VideoContainer isActive={activePlayer === "one"}>
            <PlayerWrapper
              data-vjs-player
            >
              <video
                ref={videoOneRef}
                className="video-js vjs-big-play-centered vjs-fluid w-full"
              />
            </PlayerWrapper>
          </VideoContainer>
          <VideoContainer isActive={activePlayer === "two"}>
            <PlayerWrapper
              data-vjs-player
            >
              <video
                ref={videoTwoRef}
                className="video-js vjs-big-play-centered vjs-fluid w-full"
              />
            </PlayerWrapper>
          </VideoContainer>
        </VideoWrapper>
      </Column>
    </Row>
  );
};
