import { useVideoJs } from '@/hooks/useVideoJS';
// import { VideoJSOptions } from '@/types/video-js.types';
// import Player from 'video.js/dist/types/player';
import { FC, useLayoutEffect } from 'react';
// import { Row, Column, Text } from '@/components/shared';
import 'video.js/dist/video-js.css';
import { useWebClient } from '@/hooks/useWebClient';
import { Container, PlayerWrapper, VideoContainer, VideoWrapper } from './video-js.styled';

type VideoJSProps = {
  // options: VideoJSOptions;
  // onReady?: (player: Player) => void;
}

export const VideoJS: FC<VideoJSProps> = () => {
  // const videoRef = useRef<HTMLDivElement>(null);
  const { activePlayer, videoOne, videoTwo, initializePlayer, destroyPlayer } = useVideoJs();
  const { handleOnEnded } = useWebClient();

  useLayoutEffect(() => {
    // if (videoRef.current) {
    //   // create the video element
    //   const videoElement = document.createElement("video-js");
    //   videoElement.classList.add('vjs-big-play-centered', 'vjs-fluid', 'w-full');
    //   videoRef.current.appendChild(videoElement); // append to DOM

    //   // adding CSS styles
    //   // add unique ids to avoid duplicates
    //   const styleId = 'video-player-transitions';

    //   if (!document.getElementById(styleId)) {
    //     const style = document.createElement('style');
    //     style.id = styleId;
    //     style.textContent = `
    //     .video-js video {
    //       transition: opacity 0.5s ease;
    //     }

    //     .video-js.vjs-transitioning video {
    //       opacity: 0;
    //     }
    //   `;
    //     document.head.appendChild(style);
    //   }

    //   // initialize player
    //   if (videoOne.current && videoTwo.current) {
    //     initializePlayer({ videoOneElement: videoOne.current, videoTwoElement: videoTwo.current, options: { controls: true }, events: { onEnded: handleOnEnded } });
    //   }
    // }

    if (videoOne.current && videoTwo.current) {
      initializePlayer({ videoOneElement: videoOne.current, videoTwoElement: videoTwo.current, options: { controls: true }, events: { onEnded: handleOnEnded } });
    }

    return () => {
      destroyPlayer();
    };
  }, [videoOne, videoTwo, initializePlayer, destroyPlayer, handleOnEnded]);

  return (
    <Container>
      <VideoWrapper>
        <VideoContainer isActive={activePlayer === "one"}>
          <PlayerWrapper
            data-vjs-player
          // onClick={() => player1Ref.current && handleVideoClick(player1Ref.current)}
          >
            <video
              ref={videoOne}
              className="video-js vjs-big-play-centered vjs-fluid"
            />
          </PlayerWrapper>
        </VideoContainer>
        <VideoContainer isActive={activePlayer === "two"}>
          <PlayerWrapper
            data-vjs-player
          // onClick={() => player2Ref.current && handleVideoClick(player2Ref.current)}
          >
            <video
              ref={videoTwo}
              className="video-js vjs-big-play-centered vjs-fluid"
            />
          </PlayerWrapper>
        </VideoContainer>
      </VideoWrapper>
    </Container>
  );
};
