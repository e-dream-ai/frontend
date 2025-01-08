import { VideoJSOptions } from "@/types/video-js.types";
import { VoidFunction } from "@/utils/function.util";
import { createContext, useCallback, useMemo, useRef, useState } from "react";
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

type VideoJSEvents = {
  onEnded?: () => void;
  onReady?: () => void;
  onError?: (error: unknown) => void;
};

type InitializePlayerParams = {
  element: HTMLElement;
  options: VideoJSOptions;
  events?: VideoJSEvents;
};

// create context
type VideoJSContextType = {
  player: React.MutableRefObject<Player | null>;
  isReady: boolean;
  initializePlayer: (params: InitializePlayerParams) => void;
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
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<Player | null>(null);

  const initializePlayer = useCallback(({ element, options, events }: InitializePlayerParams) => {
    console.log('initializePlayer');
    // make sure to dispose of any existing player
    if (playerRef.current && !playerRef.current.isDisposed()) {
      playerRef.current.dispose();
    }

    // initialize new player
    const player = videojs(element, options);
    playerRef.current = player;
    // update isReady value when videojs loads
    player.ready(() => {
      setIsReady(true);
      events?.onReady?.();
    });

    player.on('ended', events?.onEnded ?? VoidFunction);
  }, []);

  const destroyPlayer = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (player.isDisposed()) {
      player.dispose();
      playerRef.current = null;
    }
  }, []);

  const setBrightness = useCallback((value: number) => {
    const player = playerRef.current;
    if (!player) return;

    const videoElement = player?.el().querySelector('video');
    if (videoElement) {
      videoElement.style.filter = `brightness(${value})`;
    }
  }, []);

  const playVideo = useCallback((src: string) => {
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
  }, []);

  const memoedValue = useMemo(
    () => ({ player: playerRef, initializePlayer, destroyPlayer, setBrightness, playVideo, isReady }),
    [playerRef, initializePlayer, destroyPlayer, setBrightness, playVideo, isReady
    ],
  );

  return (
    <VideoJSContext.Provider value={memoedValue}>
      {children}
    </VideoJSContext.Provider>
  );
};

export default VideoJSContext;
