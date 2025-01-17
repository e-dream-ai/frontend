import { VideoJSOptions } from "@/types/video-js.types";
import { createContext, RefObject, useCallback, useMemo, useRef, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import Component from "video.js/dist/types/component";
import { v4 as uuidv4 } from 'uuid';
import { PoolConfig, TRANSITION_THRESHOLD, VIDEOJS_EVENTS } from "@/constants/video-js.constants";

type VideoJSContextType = {
  isReady: boolean;
  activePlayer: string | null;
  players: Map<string, PlayerInstance>;
  videoWrapperRef: RefObject<HTMLDivElement>;
  createPlayer: () => string;
  removePlayer: (id: string) => void;
  registerPlayer: (element: HTMLVideoElement, options: VideoJSOptions) => string;
  unregisterPlayer: (id: string) => void;
  addEventListener: (event: string, handler: VideoJSEventHandler) => () => void;
  setBrightness: (value: number) => void;
  playVideo: (src: string) => Promise<boolean>;
  preloadVideo: (src: string) => Promise<boolean>;
  toggleFullscreen: () => void;
  setPlaybackRate: (playbackRate: number) => void;
}

type VideoJSEventHandler = (event: unknown) => void;

// type for player instance
type PlayerInstance = {
  id: string;
  player: Player | null;
  isActive: boolean;
  lastUsed: number;
  currentSrc: string | null;
  isPreloaded: boolean;
  eventHandlers: Map<string, VideoJSEventHandler[]>;
};

/**
 *  VideoJS Context is wrapper for video.js that manages multiple player instances to enable video transitions and crossfade effects. 
 *  It maintains has a pool of video players where one remains active while others preload content, ensuring smooth playback transitions without interruptions (or try to).
 *  Context serves exclusively as a controller for video.js instances and their features, events, etc. 
 */
const VideoJSContext = createContext<VideoJSContextType | undefined>(undefined);

// generate uuuid fn 
const generatePlayerId = () => `player-${uuidv4()}`;

export const VideoJSProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const playersPoolRef = useRef<Map<string, PlayerInstance>>(new Map());
  const activePlayerIdRef = useRef<string | null>(null);
  const globalEventHandlersRef = useRef<Map<string, VideoJSEventHandler[]>>(new Map());
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  // players pool
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);

  const updateActivePlayer = useCallback((ap: string | null) => {
    activePlayerIdRef.current = ap;
    setActivePlayerId(ap);
  }, []);

  // toggle fullscreen for video wrapper
  const toggleFullscreen = useCallback(async () => {
    if (!videoWrapperRef.current) return;

    if (document.fullscreenElement === videoWrapperRef.current) {
      await document.exitFullscreen();
    } else {
      await videoWrapperRef.current.requestFullscreen();
    }
  }, []);

  // create a new player slot without initializing videojs
  const createPlayer = useCallback(() => {
    const id = generatePlayerId();

    const playerInstance: PlayerInstance = {
      id,
      // it'll be initialized when dom element is available
      player: null,
      isActive: playersPoolRef.current.size === 0,
      lastUsed: Date.now(),
      currentSrc: null,
      isPreloaded: false,
      eventHandlers: new Map()
    };

    playersPoolRef.current.set(id, playerInstance);

    if (playersPoolRef.current.size === 1) {
      updateActivePlayer(id);
    }

    if (playersPoolRef.current.size >= PoolConfig.minPlayers) {
      setIsReady(true);
    }

    return id;
  }, [updateActivePlayer]);

  // remove a player slot
  const removePlayer = useCallback((id: string) => {
    const playerInstance = playersPoolRef.current.get(id);
    if (playerInstance) {
      if (playerInstance.player && !playerInstance.player.isDisposed()) {
        playerInstance.player.dispose();
      }
      playersPoolRef.current.delete(id);

      if (id === activePlayerId) {
        const remainingPlayers = Array.from(playersPoolRef.current.values())
          .filter(p => p.id !== id);
        if (remainingPlayers.length > 0) {
          updateActivePlayer(remainingPlayers[0].id);
        } else {
          updateActivePlayer(null);
        }
      }
    }
  }, [updateActivePlayer, activePlayerId]);

  // register player into a pool slot
  const registerPlayer = useCallback((element: HTMLVideoElement, options: VideoJSOptions) => {

    // create player
    const player = videojs(element, options);
    const playerInstance = Array.from(playersPoolRef.current.values())
      .find(p => p.player === null);

    if (!playerInstance) {
      throw new Error('No available player slot');
    }

    playerInstance.player = player;

    // add existing global event handlers to new player
    globalEventHandlersRef.current.forEach((handlers, event) => {
      handlers.forEach(handler => {
        const wrappedHandler = (e: unknown) => {
          if (playerInstance.isActive) {
            handler(e);
          }
        };
        player.on(event, wrappedHandler);

        const instanceHandlers = playerInstance.eventHandlers.get(event) || [];
        playerInstance.eventHandlers.set(event, [...instanceHandlers, wrappedHandler]);
      });
    });

    // replace fullscreen properties to work with video wrapper
    player.ready(() => {
      // get the fullscreen toggle button component
      const fullscreenToggle = player?.getChild('ControlBar')?.getChild('FullscreenToggle') as Component & {
        handleClick: (event: Event) => void;
      };

      if (fullscreenToggle) {
        // override all player functions related with fullscreen

        // override handleClick fn
        fullscreenToggle.handleClick = (event: Event) => {
          // prevent default behavior
          event.preventDefault();

          // call fullscreen toggle
          toggleFullscreen();

          // focus the active player element
          // needed since fullscreen button got focused after click and don't allow keyboard events
          const activePlayer = activePlayerIdRef.current ?
            playersPoolRef.current.get(activePlayerIdRef.current) : null;

          if (activePlayer?.player) {
            const videoElement = activePlayer.player.el().querySelector('video');
            videoElement?.focus();
          }
        };

        // override isFullscreen fn to check container state
        player.isFullscreen = () => {
          return document.fullscreenElement === videoWrapperRef.current;
        };

        // override requestFullscreen fn
        player.requestFullscreen = async () => {
          videoWrapperRef.current?.requestFullscreen();
        };

        // override exitFullscreen fn
        player.exitFullscreen = () => {
          return document.exitFullscreen();
        };
      }
    });

    return playerInstance.id;
  }, [toggleFullscreen]);

  // unregister player
  const unregisterPlayer = useCallback((id: string) => {
    const playerInstance = playersPoolRef.current.get(id);
    if (playerInstance && playerInstance.player) {
      // cleanup event handlers
      playerInstance.eventHandlers.forEach((handlers, event) => {
        handlers.forEach(handler => {
          playerInstance.player?.off(event, handler);
        });
      });

      if (!playerInstance.player.isDisposed()) {
        playerInstance.player.dispose();
      }
      playerInstance.player = null;
    }
  }, []);

  const addEventListener = useCallback((event: string, handler: VideoJSEventHandler) => {
    const handlers = globalEventHandlersRef.current.get(event) || [];
    globalEventHandlersRef.current.set(event, [...handlers, handler]);

    // add handler to existing players
    playersPoolRef.current.forEach((playerInstance) => {
      if (playerInstance.player) {
        const wrappedHandler = (e: unknown) => {
          // run it only if is active
          if (playerInstance.isActive) {
            handler(e);
          }
        };

        // register event
        playerInstance.player.on(event, wrappedHandler);

        const instanceHandlers = playerInstance.eventHandlers.get(event) || [];
        playerInstance.eventHandlers.set(event, [...instanceHandlers, wrappedHandler]);
      }
    });

    return () => {
      const handlers = globalEventHandlersRef.current.get(event) || [];
      globalEventHandlersRef.current.set(
        event,
        handlers.filter(h => h !== handler)
      );

      playersPoolRef.current.forEach((playerInstance) => {
        if (playerInstance.player) {
          const handlers = playerInstance.eventHandlers.get(event) || [];
          handlers.forEach(h => playerInstance.player?.off(event, h));
          playerInstance.eventHandlers.delete(event);
        }
      });
    };
  }, []);

  const playVideo = useCallback(async (src: string): Promise<boolean> => {
    const currentPlayer = activePlayerIdRef.current ?
      playersPoolRef.current.get(activePlayerIdRef.current) : null;

    // find players by next preferences:
    // - preloaded players with matching source
    // - player with matching source
    // - oldest last used inactive player
    const nextPlayerInstance = Array.from(playersPoolRef.current.values())
      .filter(p => !p.isActive && p.player)
      .sort((a, b) => {
        // preloaded players with matching source
        if (a.isPreloaded && a.currentSrc === src) return -1;
        if (b.isPreloaded && b.currentSrc === src) return 1;

        // player with matching source
        if (a.currentSrc === src) return -1;
        if (b.currentSrc === src) return 1;

        // oldest last used inactive player
        return a.lastUsed - b.lastUsed;
      })[0];

    if (!nextPlayerInstance || !nextPlayerInstance.player) return false;

    const nextPlayer = nextPlayerInstance.player;
    const currentPlaybackRate = currentPlayer?.player?.playbackRate() || 1;

    console.log({ currentPlaybackRate });

    try {
      // set source if different from current
      if (nextPlayerInstance.currentSrc !== src) {
        nextPlayer.src({ src });
        nextPlayerInstance.currentSrc = src;

        await new Promise<void>((resolve) => {
          nextPlayer.one(VIDEOJS_EVENTS.CANPLAY, resolve);
        });
      }

      // set playback rate
      nextPlayer.playbackRate(currentPlaybackRate);

      // update lastUsed for both current and next player to prevent cleanup
      nextPlayerInstance.lastUsed = Date.now();
      if (currentPlayer) {
        currentPlayer.lastUsed = Date.now();
      }

      await nextPlayer.play();

      if (currentPlayer) {
        currentPlayer.isActive = false;
        currentPlayer.lastUsed = Date.now();
      }

      nextPlayerInstance.isActive = true;
      nextPlayerInstance.isPreloaded = false;
      nextPlayerInstance.lastUsed = Date.now();
      updateActivePlayer(nextPlayerInstance.id);

      // wait transition
      await new Promise<void>((resolve) => {
        // TRANSITION_THRESHOLD / 2 
        setTimeout(resolve, TRANSITION_THRESHOLD / 2 * 1000);
      });

      if (currentPlayer) {

        // stop playing current player
        currentPlayer?.player?.pause();
        currentPlayer?.player?.currentTime(0);
      }

      return true;
    } catch (_) {
      nextPlayerInstance.isPreloaded = false;
      return false;
    }
  }, [updateActivePlayer]);

  const preloadVideo = useCallback(async (src: string): Promise<boolean> => {
    // find inactive players that are not preloaded
    const inactivePlayers = Array.from(playersPoolRef.current.values())
      .filter(p => !p.isActive && !p.isPreloaded && p.player)
      .sort((a, b) => a.lastUsed - b.lastUsed);

    const preloadPlayerInstance = inactivePlayers[0];
    if (!preloadPlayerInstance || !preloadPlayerInstance.player) return false;

    try {
      const player = preloadPlayerInstance.player;

      // set source
      player.src({ src });
      preloadPlayerInstance.currentSrc = src;
      preloadPlayerInstance.isPreloaded = true;

      // wait for ready to play
      await new Promise<void>((resolve) => {
        player.one(VIDEOJS_EVENTS.CANPLAY, resolve);
      });

    } catch (error) {
      preloadPlayerInstance.isPreloaded = false;
      return false;
    }

    return true;
  }, []);

  const setBrightness = useCallback((value: number) => {
    playersPoolRef.current.forEach(p => {
      const videoElement = p.player?.el()?.querySelector("video");
      if (videoElement) {
        videoElement.style.filter = `brightness(${value})`;
      }
    });
  }, []);

  const setPlaybackRate = useCallback((playbackRate: number) => {
    playersPoolRef.current.forEach(p => {
      if (p.player) {
        p.player.playbackRate(playbackRate);
      }
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      isReady,
      activePlayer: activePlayerId,
      players: playersPoolRef.current,
      videoWrapperRef,
      registerPlayer,
      unregisterPlayer,
      addEventListener,
      setBrightness,
      playVideo,
      preloadVideo,
      toggleFullscreen,
      setPlaybackRate,
      createPlayer,
      removePlayer,
    }),
    [
      isReady,
      activePlayerId,
      videoWrapperRef,
      registerPlayer,
      unregisterPlayer,
      addEventListener,
      setBrightness,
      playVideo,
      preloadVideo,
      toggleFullscreen,
      setPlaybackRate,
      createPlayer,
      removePlayer,
    ]
  );

  return (
    <VideoJSContext.Provider value={contextValue}>
      {children}
    </VideoJSContext.Provider>
  );
};

export default VideoJSContext;