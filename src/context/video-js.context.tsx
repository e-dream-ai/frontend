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
    if (!player) {
      console.warn('[Player] No player reference found');
      return;
    }

    // log player state
    console.log('[Player] Player state:', {
      src,
      currentSrc: player.currentSrc(),
      readyState: player.readyState(),
      error: player.error()
    });

    const transitioningClass = "vjs-transitioning";

    // remove transitioning class if already exists 
    player.removeClass(transitioningClass);

    // add transitioning class to start animation
    player.addClass(transitioningClass);

    // wait for animation
    setTimeout(() => {
      try {
        // clean up event listeners
        player.off('loadeddata');
        player.off('error');

        // listen for error handling
        player.one('error', () => {
          console.error('[Player] Load error:', player.error());
          player.removeClass(transitioningClass);
        });

        // listen for success handling
        player.one('loadeddata', () => {
          console.log('[Player] Video loaded:', src);
          player.removeClass(transitioningClass);
        });

        // set source 
        player.src({
          src: src,
        });

        // handle play promise
        const playPromise = player.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('[Player] Play error:', error);
            player.removeClass(transitioningClass);
          });
        }
      } catch (error) {
        console.error('[Player] Error in playVideo:', error);
        player.removeClass(transitioningClass);
      }
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
