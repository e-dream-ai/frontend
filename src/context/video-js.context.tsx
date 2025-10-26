// contexts/video-js.context.tsx
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

type VideoFrameMetadata = {
  presentationTime: number;
  expectedDisplayTime: number;
  width: number;
  height: number;
  mediaTime: number;
};

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
  startFrameReading: (
    onFrame: (frame: VideoFrame, metadata: VideoFrameMetadata) => void,
  ) => void;
  stopFrameReading: () => void;
};

type VideoJSEventHandler = (event: unknown) => void;

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

const VideoJSContext = createContext<VideoJSContextType | undefined>(undefined);

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
  const frameCallbackIdRef = useRef<number | null>(null);
  const frameCallbackRef = useRef<
    ((frame: VideoFrame, metadata: VideoFrameMetadata) => void) | null
  >(null);

  const [isReady, setIsReady] = useState(false);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const updateActivePlayer = useCallback((ap: string | null) => {
    activePlayerIdRef.current = ap;
    setActivePlayerId(ap);
  }, []);

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

  const createPlayer = useCallback(() => {
    const id = generatePlayerId();

    const playerInstance: PlayerInstance = {
      id,
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
      setIsReady(true);
    }

    return id;
  }, [updateActivePlayer]);

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

  const registerPlayer = useCallback(
    (element: HTMLVideoElement, options: VideoJSOptions) => {
      const player = videojs(element, options);
      const playerInstance = Array.from(playersPoolRef.current.values()).find(
        (p) => p.player === null,
      );

      if (!playerInstance) {
        throw new Error("No available player slot");
      }

      playerInstance.player = player;

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

      player.ready(() => {
        const fullscreenToggle = player
          ?.getChild("ControlBar")
          ?.getChild("FullscreenToggle") as Component & {
          handleClick: (event: Event) => void;
        };

        if (fullscreenToggle) {
          fullscreenToggle.handleClick = (event: Event) => {
            event.preventDefault();
            toggleFullscreen();

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

          player.isFullscreen = () => {
            return document.fullscreenElement === videoWrapperRef.current;
          };

          player.requestFullscreen = async () => {
            videoWrapperRef.current?.requestFullscreen();
          };

          player.exitFullscreen = () => {
            return document.exitFullscreen();
          };
        }
      });

      return playerInstance.id;
    },
    [toggleFullscreen],
  );

  const unregisterPlayer = useCallback((id: string) => {
    const playerInstance = playersPoolRef.current.get(id);
    if (playerInstance && playerInstance.player) {
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
    playersPoolRef.current.forEach((playerInstance) => {
      if (playerInstance.player && !playerInstance.player.isDisposed()) {
        playerInstance.eventHandlers.forEach((handlers, event) => {
          handlers.forEach((handler) => {
            playerInstance.player?.off(event, handler);
          });
        });
        playerInstance.eventHandlers.clear();
        playerInstance.player.dispose();
      }
    });

    playersPoolRef.current.clear();
    updateActivePlayer(null);
    setIsReady(false);
  }, [updateActivePlayer]);

  const addEventListener = useCallback(
    (event: string, handler: VideoJSEventHandler) => {
      const handlers = globalEventHandlersRef.current.get(event) || [];
      globalEventHandlersRef.current.set(event, [...handlers, handler]);

      playersPoolRef.current.forEach((playerInstance) => {
        if (playerInstance.player) {
          const wrappedHandler = (e: unknown) => {
            if (playerInstance.isActive) {
              handler(e);
            }
          };

          playerInstance.player.on(event, wrappedHandler);

          playerInstance.player.on(VIDEOJS_EVENTS.PLAY, () => {
            playerInstance?.player?.userActive(false);
          });

          playerInstance.player.on(VIDEOJS_EVENTS.ENDED, () => {
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

  const stopFrameReading = useCallback(() => {
    const videoElement = getActiveVideoElement();

    if (
      frameCallbackIdRef.current !== null &&
      videoElement &&
      "cancelVideoFrameCallback" in videoElement
    ) {
      videoElement.cancelVideoFrameCallback(frameCallbackIdRef.current);
      frameCallbackIdRef.current = null;
    }

    frameCallbackRef.current = null;
  }, [getActiveVideoElement]);

  const startFrameReading = useCallback(
    (onFrame: (frame: VideoFrame, metadata: VideoFrameMetadata) => void) => {
      stopFrameReading();

      const videoElement = getActiveVideoElement();
      if (!videoElement) {
        console.warn("No active video element found");
        return;
      }

      frameCallbackRef.current = onFrame;

      if ("requestVideoFrameCallback" in videoElement) {
        const processFrame = (
          _now: DOMHighResTimeStamp,
          metadata: VideoFrameCallbackMetadata,
        ) => {
          const callback = frameCallbackRef.current;
          if (!callback) return;

          try {
            const frame = new VideoFrame(videoElement, {
              timestamp: metadata.mediaTime * 1_000_000,
            });

            const frameMetadata: VideoFrameMetadata = {
              presentationTime: metadata.presentationTime,
              expectedDisplayTime: metadata.expectedDisplayTime,
              width: metadata.width,
              height: metadata.height,
              mediaTime: metadata.mediaTime,
            };

            callback(frame, frameMetadata);
            frame.close();

            if (frameCallbackRef.current !== null) {
              frameCallbackIdRef.current =
                videoElement.requestVideoFrameCallback(processFrame);
            }
          } catch (error) {
            console.error("Error processing frame:", error);
          }
        };

        frameCallbackIdRef.current =
          videoElement.requestVideoFrameCallback(processFrame);
      } else {
        console.warn(
          "requestVideoFrameCallback not supported, using canvas fallback",
        );
        startCanvasFrameCapture(videoElement, onFrame); // Pass onFrame here
      }
    },
    [getActiveVideoElement, stopFrameReading],
  );

  const startCanvasFrameCapture = useCallback(
    (
      videoElement: HTMLVideoElement,
      _onFrame: (frame: VideoFrame, metadata: VideoFrameMetadata) => void, // Add parameter
    ) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      const captureFrame = () => {
        const callback = frameCallbackRef.current;
        if (!callback) return;

        ctx.drawImage(videoElement, 0, 0);

        createImageBitmap(canvas)
          .then((bitmap) => {
            const callback = frameCallbackRef.current;
            if (!callback) {
              bitmap.close();
              return;
            }

            const frame = new VideoFrame(bitmap, {
              timestamp: videoElement.currentTime * 1_000_000,
            });

            const metadata: VideoFrameMetadata = {
              presentationTime: performance.now(),
              expectedDisplayTime: performance.now(),
              width: videoElement.videoWidth,
              height: videoElement.videoHeight,
              mediaTime: videoElement.currentTime,
            };

            callback(frame, metadata);

            frame.close();
            bitmap.close();

            if (frameCallbackRef.current !== null) {
              frameCallbackIdRef.current = requestAnimationFrame(captureFrame);
            }
          })
          .catch((error) => {
            console.error("Error creating bitmap:", error);
          });
      };

      captureFrame();
    },
    [],
  );

  useEffect(() => {
    return () => {
      stopFrameReading();
    };
  }, [stopFrameReading]);

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

      const nextPlayers = Array.from(playersPoolRef.current.values())
        .filter((p) => !p.isActive && p.player)
        .sort((a, b) => {
          const PRIORITY = {
            PRELOADED_WITH_MATCH: 2,
            SRC_MATCH: 1,
            NONE: 0,
          };

          const getPriority = (player: PlayerInstance) => {
            if (player.src !== src) return PRIORITY.NONE;
            if (player.isPreloaded) return PRIORITY.PRELOADED_WITH_MATCH;
            return PRIORITY.SRC_MATCH;
          };

          const diff = getPriority(b) - getPriority(a);
          return diff || a.lastUsed - b.lastUsed;
        });

      const nextPlayerInstance = nextPlayers[0];
      if (!nextPlayerInstance || !nextPlayerInstance.player) {
        return false;
      }
      const nextPlayer = nextPlayerInstance.player;
      const currentPlaybackRate = currentPlayer?.player?.playbackRate() || 1;

      try {
        if (nextPlayerInstance.src !== src) {
          nextPlayer.src({ src, preload: PRELOAD_OPTION });
          nextPlayerInstance.src = src;
        }

        nextPlayer.playbackRate(currentPlaybackRate);
        nextPlayerInstance.lastUsed = Date.now();
        nextPlayerInstance.skipCrossfade = options?.skipCrossfade ?? false;
        nextPlayerInstance.longTransition = options?.longTransition ?? false;

        await nextPlayer.play();

        if (currentPlayer) {
          currentPlayer.isActive = false;
          currentPlayer.lastUsed = Date.now();
          currentPlayer.skipCrossfade = options?.skipCrossfade ?? false;
          currentPlayer.longTransition = options?.longTransition ?? false;
        }

        nextPlayerInstance.lastUsed = Date.now();
        nextPlayerInstance.isActive = true;
        updateActivePlayer(nextPlayerInstance.id);

        if (!options.skipCrossfade) {
          await new Promise<void>((resolve) => {
            setTimeout(
              resolve,
              (options?.longTransition
                ? LONG_CROSSFADE_DURATION
                : SHORT_CROSSFADE_DURATION) * 1000,
            );
          });
        }

        if (currentPlayer) {
          currentPlayer?.player?.pause();
          currentPlayer?.player?.currentTime(0);
          currentPlayer?.player?.hasStarted(false);
        }

        return true;
      } catch (_) {
        nextPlayerInstance.isPreloaded = false;
        return false;
      }
    },
    [updateActivePlayer],
  );

  const preloadVideo = useCallback(async (src: string): Promise<boolean> => {
    const players = Array.from(playersPoolRef.current.values());
    const existingPreloadedPlayer = players.find(
      (p) => p.isPreloaded && p.src === src,
    );

    if (existingPreloadedPlayer) {
      return true;
    }

    const inactivePlayers = players
      .filter((p) => !p.isActive && p.player)
      .sort((a, b) => a.lastUsed - b.lastUsed);

    const preloadPlayerInstance = inactivePlayers[0];
    if (!preloadPlayerInstance || !preloadPlayerInstance.player) {
      return false;
    }

    try {
      const player = preloadPlayerInstance.player;

      preloadPlayerInstance.src = src;
      player.src({ src, preload: PRELOAD_OPTION });

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
      startFrameReading,
      stopFrameReading,
    }),
    [
      isReady,
      activePlayerId,
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
      startFrameReading,
      stopFrameReading,
    ],
  );

  return (
    <VideoJSContext.Provider value={contextValue}>
      {children}
    </VideoJSContext.Provider>
  );
};

export default VideoJSContext;
