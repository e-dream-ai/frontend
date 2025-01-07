import { VideoJSOptions } from "@/types/video-js.types";
import { createContext, useCallback, useRef } from "react";
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

// create context
type VideoJSContextType = {
  player: React.MutableRefObject<Player | null>;
  initializePlayer: (element: HTMLElement, options: VideoJSOptions, onReady?: (player: Player) => void) => void;
  destroyPlayer: () => void;
  setBrightness: (value: number) => void;
  playVideo: (src: string) => void;
}

const VideoJSContext = createContext<VideoJSContextType | undefined>(undefined);

export const VideoJSProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const playerRef = useRef<Player | null>(null);

  const initializePlayer = (
    element: HTMLElement,
    options: VideoJSOptions,
    onReady?: (player: Player) => void
  ) => {
    // make sure to dispose of any existing player
    if (playerRef.current && !playerRef.current.isDisposed()) {
      playerRef.current.dispose();
    }

    // initialize new player
    playerRef.current = videojs(element, options, () => {
      onReady?.(playerRef.current!);
    });
  };

  const destroyPlayer = () => {
    if (playerRef.current && !playerRef.current.isDisposed()) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
  };


  const setBrightness = useCallback((value: number) => {
    const videoElement = playerRef.current?.el().querySelector('video');
    if (videoElement) {
      videoElement.style.filter = `brightness(${value})`;
    }
  }, []);

  const playVideo = (src: string) => {
    const player = playerRef.current;
    if (!player) return;

    // add transitioning class to start fade out
    player.addClass('vjs-transitioning');

    // wait for fade out
    setTimeout(() => {
      player.src(src);

      // remove transitioning class when new video loads
      player.one('loadeddata', () => {
        player.removeClass('vjs-transitioning');
      });

      player.play();
    }, 500); // match this with CSS transition duration
  };

  return (
    <VideoJSContext.Provider value={{ player: playerRef, initializePlayer, destroyPlayer, setBrightness, playVideo }}>
      {children}
    </VideoJSContext.Provider>
  );
};

export default VideoJSContext;
