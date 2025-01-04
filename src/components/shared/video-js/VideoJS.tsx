import { FC, useEffect, useRef } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

// types for video sources
interface VideoSource {
  src: string;
  type: string;
}

// types for videojs options
interface VideoJSOptions {
  autoplay?: boolean;
  controls?: boolean;
  responsive?: boolean;
  fluid?: boolean;
  sources: VideoSource[];
  width?: number;
  height?: number;
  playbackRates?: number[];
}

type VideoJSProps = {
  isPaused?: boolean;
  playbackRate?: number;
  options: VideoJSOptions;
  onReady?: (player: Player) => void;
}

export const VideoJS: FC<VideoJSProps> = ({ isPaused, playbackRate, ...props }) => {

  console.log({ isPaused, playbackRate })
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const { options, onReady } = props;

  useEffect(() => {
    // make sure videojs player is only initialized once
    if (!playerRef.current) {
      // videojs player needs to be _inside_ the component el for React 18 Strict Mode
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered', 'vjs-fluid', 'w-full');
      videoRef.current?.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        ...options,
      }, () => {
        onReady?.(player);
      });

      // update values on prop change
    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, onReady]);

  // dispose the videojs player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  // handle pause state changes from props
  useEffect(() => {
    const player = playerRef.current;
    if (player && typeof isPaused === 'boolean') {
      if (isPaused) player.pause();
      else player.play();
    }
  }, [isPaused]);

  // handle playbackRate state changes from props
  useEffect(() => {
    const player = playerRef.current;
    if (player && typeof playbackRate === 'number') {
      player.playbackRate(playbackRate);
    }
  }, [playbackRate]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};
