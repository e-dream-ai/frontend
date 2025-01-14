import { VideoJSOptions } from "@/types/video-js.types";
import { VoidFunction } from "@/utils/function.util";
import { createContext, useCallback, useMemo, useRef, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";

type VideoJSEvents = {
  onEnded?: () => void;
  onReady?: () => void;
  onError?: (error: unknown) => void;
};

type ActivePlayer = "one" | "two";

type InitializePlayerParams = {
  videoOneElement: HTMLVideoElement;
  videoTwoElement: HTMLVideoElement;
  options: VideoJSOptions;
  events?: VideoJSEvents;
};

// create context
type VideoJSContextType = {
  activePlayer: ActivePlayer;
  playerOne: React.MutableRefObject<Player | null>;
  playerTwo: React.MutableRefObject<Player | null>;
  videoOne: React.RefObject<HTMLVideoElement | null>;
  videoTwo: React.RefObject<HTMLVideoElement | null>;
  isReady: boolean;
  initializePlayer: (params: InitializePlayerParams) => void;
  destroyPlayer: () => void;
  setBrightness: (value: number) => void;
  playVideo: (src: string) => void;
  toggleFullscreen: () => void;
}

const VideoJSContext = createContext<VideoJSContextType | undefined>(undefined);

export const VideoJSProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isReady, setIsReady] = useState(false);
  const [activePlayer, setActivePlayer] = useState<ActivePlayer>("one");
  const playerOneRef = useRef<Player | null>(null);
  const playerTwoRef = useRef<Player | null>(null);
  const videoOneRef = useRef<HTMLVideoElement>(null);
  const videoTwoRef = useRef<HTMLVideoElement>(null);

  const initializePlayer = useCallback(({ videoOneElement, videoTwoElement, options, events }: InitializePlayerParams) => {
    // cleanup existing players if any
    if (playerOneRef.current && !playerOneRef.current.isDisposed()) {
      playerOneRef.current.dispose();
    }
    if (playerTwoRef.current && !playerTwoRef.current.isDisposed()) {
      playerTwoRef.current.dispose();
    }

    // initialize both players
    const playerOne = videojs(videoOneElement, options);
    const playerTwo = videojs(videoTwoElement, options);

    playerOneRef.current = playerOne;
    playerTwoRef.current = playerTwo;

    // track ready state for both players
    let oneReady = false;
    let twoReady = false;

    playerOne.ready(() => {
      oneReady = true;
      if (oneReady && twoReady) {
        setIsReady(true);
        events?.onReady?.();
      }
    });

    playerTwo.ready(() => {
      twoReady = true;
      if (oneReady && twoReady) {
        setIsReady(true);
        events?.onReady?.();
      }
    });

    // event handlers
    playerOne.on("ended", events?.onEnded ?? VoidFunction);
    playerTwo.on("ended", events?.onEnded ?? VoidFunction);
  }, []);

  const destroyPlayer = useCallback(() => {
    if (playerOneRef.current && !playerOneRef.current.isDisposed()) {
      playerOneRef.current.dispose();
      playerOneRef.current = null;
    }
    if (playerTwoRef.current && !playerTwoRef.current.isDisposed()) {
      playerTwoRef.current.dispose();
      playerTwoRef.current = null;
    }
  }, []);

  const setBrightness = useCallback((value: number) => {
    const currentPlayer = activePlayer === "one" ? playerOneRef.current : playerTwoRef.current;
    if (!currentPlayer) return;

    const videoElement = currentPlayer.el().querySelector("video");
    if (videoElement) {
      videoElement.style.filter = `brightness(${value})`;
    }
  }, [activePlayer]);

  const playVideo = useCallback((src: string) => {
    const getCurrentPlayer = (active: "one" | "two") =>
      active === "one" ? playerOneRef.current : playerTwoRef.current;
    const getNextPlayer = (active: "one" | "two") =>
      active === "one" ? playerTwoRef.current : playerOneRef.current;

    setActivePlayer(prevActive => {
      const currentPlayer = getCurrentPlayer(prevActive);
      const nextPlayer = getNextPlayer(prevActive);

      if (!currentPlayer || !nextPlayer) return prevActive;

      setTimeout(async () => {
        try {
          // cleanup event listeners
          nextPlayer.off("loadeddata");
          nextPlayer.off("error");

          const wasPlaying = !currentPlayer.paused();
          nextPlayer.src({ src });

          // setup event listeners
          nextPlayer.one("error", () => {
            // error handling
          });
          nextPlayer.one("loadeddata", () => {
            // loadeddata handling
          });

          // wait for next player to be ready
          await new Promise<void>((resolve) => {
            nextPlayer.one('canplay', () => {
              resolve();
            });
          });

          if (wasPlaying) {
            try {
              await nextPlayer.play();
            } catch (error) {
              // 
            }
          }
        } catch (error) {
          //
        }
      }, 500);

      // new active player
      return prevActive === "one" ? "two" : "one";
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    const currentPlayer = activePlayer === "one" ? playerOneRef.current : playerTwoRef.current;
    if (!currentPlayer) return;

    if (currentPlayer.isFullscreen()) {
      currentPlayer.exitFullscreen();
    } else {
      currentPlayer.requestFullscreen();
    }
  }, [activePlayer]);

  const memoedValue = useMemo(
    () => ({
      activePlayer,
      playerOne: playerOneRef,
      playerTwo: playerTwoRef,
      videoOne: videoOneRef,
      videoTwo: videoTwoRef,
      isReady,
      initializePlayer,
      destroyPlayer,
      setBrightness,
      playVideo,
      toggleFullscreen,
    }),
    [activePlayer, isReady, initializePlayer, destroyPlayer, setBrightness, playVideo, toggleFullscreen],
  );

  return (
    <VideoJSContext.Provider value={memoedValue}>
      {children}
    </VideoJSContext.Provider>
  );
};

export default VideoJSContext;
