import { useVideoJs } from '@/hooks/useVideoJS';
// import { VideoJSOptions } from '@/types/video-js.types';
// import Player from 'video.js/dist/types/player';
import { FC, useEffect, useRef } from 'react';
import { Row, Column, Text } from '@/components/shared';
import 'video.js/dist/video-js.css';
import { useWebClient } from '@/hooks/useWebClient';

type VideoJSProps = {
  // options: VideoJSOptions;
  // onReady?: (player: Player) => void;
}

export const VideoJS: FC<VideoJSProps> = () => {
  const videoRef = useRef<HTMLDivElement>(null);
  const { initializePlayer, destroyPlayer } = useVideoJs();
  const { handleVideoJSReady } = useWebClient();

  useEffect(() => {
    if (videoRef.current) {
      // create the video element
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered', 'vjs-fluid', 'w-full');
      videoRef.current.appendChild(videoElement); // append to DOM

      // adding CSS styles
      const style = document.createElement('style');
      style.textContent = `
        .video-js video {
          transition: opacity 0.5s ease;
        }
        
        .video-js.vjs-transitioning video {
          opacity: 0;
        }
      `;
      document.head.appendChild(style);

      // initialize player
      initializePlayer(videoElement, { controls: true });
    }

    return () => {
      destroyPlayer();
    };
  }, [destroyPlayer, initializePlayer, handleVideoJSReady]);

  return (

    <Column mb="2rem">
      <Row justifyContent="space-between" mb="0">
        <Text mb="1rem" fontSize="1rem" fontWeight={600}>
          Web Client
        </Text>
      </Row>

      <div data-vjs-player>
        <div ref={videoRef} />
      </div></Column>
  );
};
