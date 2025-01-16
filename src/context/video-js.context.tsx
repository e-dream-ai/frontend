import { VideoJSOptions } from "@/types/video-js.types";
import { createContext, useCallback, useMemo, useRef, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";

type ActivePlayer = "one" | "two";

type InitializePlayerParams = {
  videoOneElement: HTMLVideoElement;
  videoTwoElement: HTMLVideoElement;
  options: VideoJSOptions;
};

// create context
type VideoJSContextType = {
  isReady: boolean;
  activePlayer: ActivePlayer;
  playerOne: React.MutableRefObject<Player | null>;
  playerTwo: React.MutableRefObject<Player | null>;
  initializePlayer: (params: InitializePlayerParams) => void;
  destroyPlayer: () => void;
  addEventListener: (event: string, handler: VideoJSEventHandler) => () => void;
  setBrightness: (value: number) => void;
  playVideo: (src: string) => void;
  toggleFullscreen: () => void;
  setPlaybackRate: (playbackRate: number) => void;
}

type VideoJSEventHandler = (event: unknown) => void;

const VideoJSContext = createContext<VideoJSContextType | undefined>(undefined);

export const VideoJSProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isReady, setIsReady] = useState(false);
  const [activePlayer, setActivePlayer] = useState<ActivePlayer>("one");
  const activePlayerRef = useRef<ActivePlayer>("one");
  const playerOneRef = useRef<Player | null>(null);
  const playerTwoRef = useRef<Player | null>(null);
  const eventHandlersRef = useRef<Map<string, VideoJSEventHandler[]>>(new Map());

  // updates both ref (immediate access in callbacks, no re-renders) and state (triggers re-renders) for the video player instances
  const updateActivePlayer = useCallback((ap: ActivePlayer) => {
    activePlayerRef.current = ap;
    setActivePlayer(ap);
  }, []);

  const initializePlayer = useCallback(({ videoOneElement, videoTwoElement, options }: InitializePlayerParams) => {
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
      }
    });

    playerTwo.ready(() => {
      twoReady = true;
      if (oneReady && twoReady) {
        setIsReady(true);
      }
    });
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

  const addEventListener = useCallback((
    event: string,
    handler: VideoJSEventHandler
  ) => {
    const handlers = eventHandlersRef.current.get(event) || [];
    eventHandlersRef.current.set(event, [...handlers, handler]);

    const players = [playerOneRef.current, playerTwoRef.current];
    players.forEach((player, index) => {
      if (player) {
        // trigger handler for active player
        const wrappedHandler = (e: VideoJSEventHandler) => {
          const playerNumber = index === 0 ? "one" : "two";
          if (playerNumber === activePlayerRef.current) {
            handler(e);
          }
        };

        player.on(event, wrappedHandler);
      }
    });

    return () => {
      const handlers = eventHandlersRef.current.get(event) || [];
      eventHandlersRef.current.set(event, handlers.filter(h => h !== handler));

      players.forEach(player => {
        if (player) player.off(event, handler);
      });
    };
  }, []);

  const setBrightness = useCallback((value: number) => {
    const playerRefs = [playerOneRef, playerTwoRef];

    playerRefs.forEach(playerRef => {
      const videoElement = playerRef.current?.el()?.querySelector("video");
      if (videoElement) {
        videoElement.style.filter = `brightness(${value})`;
      }
    });
  }, []);

  const playVideo = useCallback(async (src: string) => {
    const getCurrentPlayer = (active: "one" | "two") =>
      active === "one" ? playerOneRef.current : playerTwoRef.current;
    const getNextPlayer = (active: "one" | "two") =>
      active === "one" ? playerTwoRef.current : playerOneRef.current;


    const currentPlayer = getCurrentPlayer(activePlayerRef.current);
    const nextPlayer = getNextPlayer(activePlayerRef.current);

    if (!currentPlayer || !nextPlayer) return;

    const currentPlaybackRate = currentPlayer.playbackRate();
    const wasFullscreen = currentPlayer.isFullscreen();

    try {
      nextPlayer.src({ src });

      // keep playback rate from previous player
      nextPlayer.one("loadeddata", async () => {
        nextPlayer.playbackRate(currentPlaybackRate);
      });

      // wait for next player to be ready
      await new Promise<void>((resolve) => {
        nextPlayer.one("canplay", () => {
          resolve();
        });
      });

      await nextPlayer.play();

      // set fullscreen after play has started
      if (wasFullscreen) {
        await nextPlayer.requestFullscreen().catch(console.warn);
      }

    } catch (error) {
      return false;
    }

    // new active player
    updateActivePlayer(activePlayerRef.current === "one" ? "two" : "one");

    return true;
  }, [updateActivePlayer]);

  const toggleFullscreen = useCallback(() => {
    const playerRefs = [playerOneRef, playerTwoRef];

    playerRefs.forEach(playerRef => {
      const player = playerRef.current;
      if (!player) return;
      if (player.isFullscreen()) {
        player.exitFullscreen();
      } else {
        player.requestFullscreen().catch(() => {
          //
        });
      }
    });

  }, []);

  const setPlaybackRate = useCallback((playbackRate: number) => {
    const playerRefs = [playerOneRef, playerTwoRef];

    playerRefs.forEach(playerRef => {
      const player = playerRef.current;
      if (!player) return;
      player.playbackRate(playbackRate);
    });
  }, []);

  const memoedValue = useMemo(
    () => ({
      isReady,
      activePlayer,
      playerOne: playerOneRef,
      playerTwo: playerTwoRef,
      initializePlayer,
      destroyPlayer,
      addEventListener,
      setBrightness,
      playVideo,
      toggleFullscreen,
      setPlaybackRate
    }),
    [
      isReady,
      activePlayer,
      initializePlayer,
      destroyPlayer,
      addEventListener,
      setBrightness,
      playVideo,
      toggleFullscreen,
      setPlaybackRate
    ],
  );

  return (
    <VideoJSContext.Provider value={memoedValue}>
      {children}
    </VideoJSContext.Provider>
  );
};

export default VideoJSContext;
