import { VideoJSOptions } from "@/types/video-js.types";
import {
  createContext,
  RefObject,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import Component from "video.js/dist/types/component";
import { v4 as uuidv4 } from "uuid";
import {
  PoolConfig,
  VIDEOJS_EVENTS,
  LONG_CROSSFADE_DURATION,
  SHORT_CROSSFADE_DURATION,
  PRELOAD_OPTION,
} from "@/constants/video-js.constants";

type VideoJSContextType = {
  isReady: boolean;
  activePlayer: string | null;
  players: PlayerInstance[];
  videoWrapperRef: RefObject<HTMLDivElement>;
  currentTime: number;
  duration: number;
  getActiveVideoElement: () => HTMLVideoElement | null;
  createPlayer: () => string;
  removePlayer: (id: string) => void;
  registerPlayer: (
    element: HTMLVideoElement,
    options: VideoJSOptions,
  ) => string;
  unregisterPlayer: (id: string) => void;
  clearPlayers: () => void;
  addEventListener: (event: string, handler: VideoJSEventHandler) => () => void;
  setBrightness: (value: number) => void;
  playVideo: (
    src: string,
    options?: { skipCrossfade: boolean; longTransition: boolean },
  ) => Promise<boolean>;
  preloadVideo: (src: string) => Promise<boolean>;
  toggleFullscreen: () => void;
  setPlaybackRate: (playbackRate: number) => void;
};

type VideoJSEventHandler = (event: unknown) => void;

// type for player instance
type PlayerInstance = {
  id: string;
  player: Player | null;
  isActive: boolean;
  lastUsed: number;
  src: string | null;
  isPreloaded: boolean;
  eventHandlers: Map<string, VideoJSEventHandler[]>;
  skipCrossfade: boolean;
  longTransition: boolean;
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
  const globalEventHandlersRef = useRef<Map<string, VideoJSEventHandler[]>>(
    new Map(),
  );
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  // players pool
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  // playback state
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

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

  const getActiveVideoElement = useCallback((): HTMLVideoElement | null => {
    const active = activePlayerIdRef.current
      ? playersPoolRef.current.get(activePlayerIdRef.current)
      : null;
    const el =
      (active?.player
        ?.el()
        ?.querySelector("video") as HTMLVideoElement | null) ?? null;
    return el;
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
      src: null,
      isPreloaded: false,
      eventHandlers: new Map(),
      skipCrossfade: false,
      longTransition: false,
    };

    playersPoolRef.current.set(id, playerInstance);

    if (playersPoolRef.current.size === 1) {
      updateActivePlayer(id);
    }

    if (playersPoolRef.current.size >= PoolConfig.minPlayers) {
      // setIsReady(true) should be changed to register player?
      setIsReady(true);
    }

    return id;
  }, [updateActivePlayer]);

  // remove a player slot
  const removePlayer = useCallback(
    (id: string) => {
      const playerInstance = playersPoolRef.current.get(id);
      if (playerInstance) {
        if (playerInstance.player && !playerInstance.player.isDisposed()) {
          playerInstance.player.dispose();
        }
        playersPoolRef.current.delete(id);

        if (id === activePlayerId) {
          const remainingPlayers = Array.from(
            playersPoolRef.current.values(),
          ).filter((p) => p.id !== id);
          if (remainingPlayers.length > 0) {
            updateActivePlayer(remainingPlayers[0].id);
          } else {
            updateActivePlayer(null);
          }
        }
      }
    },
    [updateActivePlayer, activePlayerId],
  );

  // register player into a pool slot
  const registerPlayer = useCallback(
    (element: HTMLVideoElement, options: VideoJSOptions) => {
      // create player
      const player = videojs(element, options);
      const playerInstance = Array.from(playersPoolRef.current.values()).find(
        (p) => p.player === null,
      );

      if (!playerInstance) {
        throw new Error("No available player slot");
      }

      playerInstance.player = player;

      // add existing global event handlers to new player
      globalEventHandlersRef.current.forEach((handlers, event) => {
        handlers.forEach((handler) => {
          const wrappedHandler = (e: unknown) => {
            if (playerInstance.isActive) {
              handler(e);
            }
          };
          player.on(event, wrappedHandler);

          const instanceHandlers =
            playerInstance.eventHandlers.get(event) || [];
          playerInstance.eventHandlers.set(event, [
            ...instanceHandlers,
            wrappedHandler,
          ]);
        });
      });

      // replace fullscreen properties to work with video wrapper
      player.ready(() => {
        // get the fullscreen toggle button component
        const fullscreenToggle = player
          ?.getChild("ControlBar")
          ?.getChild("FullscreenToggle") as Component & {
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
            const activePlayer = activePlayerIdRef.current
              ? playersPoolRef.current.get(activePlayerIdRef.current)
              : null;

            if (activePlayer?.player) {
              const videoElement = activePlayer.player
                .el()
                .querySelector("video");
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
    },
    [toggleFullscreen],
  );

  // unregister player
  const unregisterPlayer = useCallback((id: string) => {
    const playerInstance = playersPoolRef.current.get(id);
    if (playerInstance && playerInstance.player) {
      // cleanup event handlers
      playerInstance.eventHandlers.forEach((handlers, event) => {
        handlers.forEach((handler) => {
          playerInstance.player?.off(event, handler);
        });
      });

      if (!playerInstance.player.isDisposed()) {
        playerInstance.player.dispose();
      }
      playerInstance.player = null;
      playersPoolRef.current.delete(id);
    }
  }, []);

  const clearPlayers = useCallback(() => {
    // loop through player instances
    playersPoolRef.current.forEach((playerInstance) => {
      if (playerInstance.player && !playerInstance.player.isDisposed()) {
        // cleanup event handlers
        playerInstance.eventHandlers.forEach((handlers, event) => {
          handlers.forEach((handler) => {
            playerInstance.player?.off(event, handler);
          });
        });
        playerInstance.eventHandlers.clear();

        // dispose instance
        playerInstance.player.dispose();
      }
    });

    // clear pool
    playersPoolRef.current.clear();

    // reset active player
    updateActivePlayer(null);

    // reset ready
    setIsReady(false);
  }, [updateActivePlayer]);

  const addEventListener = useCallback(
    (event: string, handler: VideoJSEventHandler) => {
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

          // register `playing` event important for all instances
          playerInstance.player.on(VIDEOJS_EVENTS.PLAY, () => {
            // sets user as inactive to avoid controls flash by end of video
            playerInstance?.player?.userActive(false);
          });

          // register `ended` event important for all instances
          playerInstance.player.on(VIDEOJS_EVENTS.ENDED, () => {
            // sets user as inactive to avoid controls flash by end of video
            playerInstance?.player?.userActive(false);
          });

          const instanceHandlers =
            playerInstance.eventHandlers.get(event) || [];
          playerInstance.eventHandlers.set(event, [
            ...instanceHandlers,
            wrappedHandler,
          ]);
        }
      });

      return () => {
        const handlers = globalEventHandlersRef.current.get(event) || [];
        globalEventHandlersRef.current.set(
          event,
          handlers.filter((h) => h !== handler),
        );

        playersPoolRef.current.forEach((playerInstance) => {
          if (playerInstance.player) {
            const handlers = playerInstance.eventHandlers.get(event) || [];
            handlers.forEach((h) => playerInstance.player?.off(event, h));
            playerInstance.eventHandlers.delete(event);
          }
        });
      };
    },
    [],
  );

  useEffect(() => {
    const offTime = addEventListener(VIDEOJS_EVENTS.TIMEUPDATE, () => {
      const active = activePlayerIdRef.current
        ? playersPoolRef.current.get(activePlayerIdRef.current)
        : null;
      const ct = active?.player?.currentTime?.() ?? 0;
      setCurrentTime(typeof ct === "number" && !Number.isNaN(ct) ? ct : 0);
      const dur = active?.player?.duration?.();
      if (typeof dur === "number" && !Number.isNaN(dur)) {
        setDuration(dur);
      }
    });

    const offMeta = addEventListener(VIDEOJS_EVENTS.LOADEDMETADATA, () => {
      const active = activePlayerIdRef.current
        ? playersPoolRef.current.get(activePlayerIdRef.current)
        : null;
      const dur = active?.player?.duration?.();
      setDuration(typeof dur === "number" && !Number.isNaN(dur) ? dur : 0);
      const ct = active?.player?.currentTime?.() ?? 0;
      setCurrentTime(typeof ct === "number" && !Number.isNaN(ct) ? ct : 0);
    });

    const offLoadStart = addEventListener(VIDEOJS_EVENTS.LOADSTART, () => {
      setCurrentTime(0);
      setDuration(0);
    });

    return () => {
      offTime();
      offMeta();
      offLoadStart();
    };
  }, [addEventListener]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const active = activePlayerIdRef.current
        ? playersPoolRef.current.get(activePlayerIdRef.current)
        : null;
      const ct = active?.player?.currentTime?.();
      if (typeof ct === "number" && !Number.isNaN(ct)) {
        setCurrentTime(ct);
      }
      const dur = active?.player?.duration?.();
      if (typeof dur === "number" && !Number.isNaN(dur)) {
        setDuration(dur);
      }
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const playVideo = useCallback(
    async (
      src: string,
      options = { skipCrossfade: false, longTransition: false },
    ): Promise<boolean> => {
      const currentPlayer = activePlayerIdRef.current
        ? playersPoolRef.current.get(activePlayerIdRef.current)
        : null;

      // find players by next preferences:
      // - preloaded players with matching source
      // - player with matching source
      // - oldest last used inactive player
      const nextPlayers = Array.from(playersPoolRef.current.values())
        .filter((p) => !p.isActive && p.player)
        .sort((a, b) => {
          const PRIORITY = {
            PRELOADED_WITH_MATCH: 2,
            SRC_MATCH: 1,
            NONE: 0,
          };

          // Determines priority level of a player based on preload status and source match
          const getPriority = (player: PlayerInstance) => {
            if (player.src !== src) return PRIORITY.NONE;
            if (player.isPreloaded) return PRIORITY.PRELOADED_WITH_MATCH;
            return PRIORITY.SRC_MATCH;
          };

          const diff = getPriority(b) - getPriority(a);
          // Otherwise is sort by last time used
          return diff || a.lastUsed - b.lastUsed;
        });

      const nextPlayerInstance = nextPlayers[0];
      if (!nextPlayerInstance || !nextPlayerInstance.player) {
        if (currentPlayer?.player) {
          try {
            console.log(
              "[VideoJS] Fallback: reuse current player (no inactive match)",
            );
            currentPlayer.src = src;
            currentPlayer.player.src({ src, preload: PRELOAD_OPTION });
            currentPlayer.player.playbackRate(
              currentPlayer?.player?.playbackRate() || 1,
            );
            currentPlayer.lastUsed = Date.now();
            await currentPlayer.player.play();
            // ensure it remains the active player
            currentPlayer.isActive = true;
            updateActivePlayer(currentPlayer.id);
            return true;
          } catch (_) {
            return false;
          }
        }
        return false;
      }
      const nextPlayer = nextPlayerInstance.player;
      const currentPlaybackRate = currentPlayer?.player?.playbackRate() || 1;

      try {
        // set source if different from current
        if (nextPlayerInstance.src !== src) {
          nextPlayer.src({ src, preload: PRELOAD_OPTION });
          nextPlayerInstance.src = src;
        }

        // set playback rate for next player
        nextPlayer.playbackRate(currentPlaybackRate);

        // update lastUsed for next player to prevent cleanup
        nextPlayerInstance.lastUsed = Date.now();
        // set crossfade options for next player
        nextPlayerInstance.skipCrossfade = options?.skipCrossfade ?? false;
        nextPlayerInstance.longTransition = options?.longTransition ?? false;

        console.log("playVideo4", nextPlayer);
        await nextPlayer.play();
        console.log("playVideo5");

        if (currentPlayer) {
          // set current player as inactive
          currentPlayer.isActive = false;
          // update lastUsed for current player
          currentPlayer.lastUsed = Date.now();
          // set crossfade options for current player so can show same effect for next show and current hide
          currentPlayer.skipCrossfade = options?.skipCrossfade ?? false;
          currentPlayer.longTransition = options?.longTransition ?? false;
        }

        nextPlayerInstance.lastUsed = Date.now();
        nextPlayerInstance.isActive = true;
        updateActivePlayer(nextPlayerInstance.id);

        // Wait for the video transition for crossfade
        if (!options.skipCrossfade) {
          await new Promise<void>((resolve) => {
            // CROSSFADE_DURATION
            setTimeout(
              resolve,
              (options?.longTransition
                ? LONG_CROSSFADE_DURATION
                : SHORT_CROSSFADE_DURATION) * 1000,
            );
          });
        }

        if (currentPlayer) {
          // stop playing current player
          currentPlayer?.player?.pause();
          currentPlayer?.player?.currentTime(0);
          // removes the vjs-has-started to avoid controls flash by end of video
          currentPlayer?.player?.hasStarted(false);
        }

        return true;
      } catch (_) {
        nextPlayerInstance.isPreloaded = false;
        if (currentPlayer?.player) {
          try {
            console.log(
              "[VideoJS] Fallback: next player failed, reuse current player",
            );
            currentPlayer.src = src;
            currentPlayer.player.src({ src, preload: PRELOAD_OPTION });
            currentPlayer.player.playbackRate(currentPlaybackRate);
            currentPlayer.lastUsed = Date.now();
            await currentPlayer.player.play();
            currentPlayer.isActive = true;
            updateActivePlayer(currentPlayer.id);
            return true;
          } catch (_) {
            return false;
          }
        }
        return false;
      }
    },
    [updateActivePlayer],
  );

  const preloadVideo = useCallback(async (src: string): Promise<boolean> => {
    // Check if we already have a preloaded player with this src
    const players = Array.from(playersPoolRef.current.values());
    const existingPreloadedPlayer = players.find(
      (p) => p.isPreloaded && p.src === src,
    );

    if (existingPreloadedPlayer) {
      return true;
    }

    // find inactive players ordered by last used
    const inactivePlayers = players
      .filter((p) => !p.isActive && p.player)
      .sort((a, b) => a.lastUsed - b.lastUsed);

    const preloadPlayerInstance = inactivePlayers[0];
    if (!preloadPlayerInstance || !preloadPlayerInstance.player) {
      return false;
    }

    try {
      const player = preloadPlayerInstance.player;

      // set source
      preloadPlayerInstance.src = src;
      player.src({ src, preload: PRELOAD_OPTION });

      // wait for metadata ready
      await new Promise<void>((resolve) => {
        player.one(VIDEOJS_EVENTS.LOADEDMETADATA, resolve);
      });

      preloadPlayerInstance.isPreloaded = true;
    } catch (error) {
      preloadPlayerInstance.isPreloaded = false;
      return false;
    }

    return true;
  }, []);

  const setBrightness = useCallback((value: number) => {
    playersPoolRef.current.forEach((p) => {
      const videoElement = p.player?.el()?.querySelector("video");
      if (videoElement) {
        videoElement.style.filter = `brightness(${value})`;
      }
    });
  }, []);

  const setPlaybackRate = useCallback((playbackRate: number) => {
    playersPoolRef.current.forEach((p) => {
      if (p.player) {
        p.player.playbackRate(playbackRate);
      }
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      isReady,
      activePlayer: activePlayerId,
      players: Array.from(playersPoolRef.current.values()),
      videoWrapperRef,
      currentTime,
      duration,
      getActiveVideoElement,
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
      clearPlayers,
    }),
    [
      isReady,
      activePlayerId,
      videoWrapperRef,
      currentTime,
      duration,
      playersPoolRef,
      getActiveVideoElement,
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
      clearPlayers,
    ],
  );

  return (
    <VideoJSContext.Provider value={contextValue}>
      {children}
    </VideoJSContext.Provider>
  );
};

export default VideoJSContext;
