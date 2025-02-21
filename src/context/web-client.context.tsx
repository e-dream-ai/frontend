import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useAuth from "@/hooks/useAuth";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";
import { useDesktopClient } from "@/hooks/useDesktopClient";
import useStatusCallback from "@/hooks/useStatusCallback";
import { useVideoJs } from "@/hooks/useVideoJS";
import useCurrentPlaylist from "@/api/dream/query/useCurrentPlaylist";
import { RemoteControlEventData, RemoteEvent } from "@/types/remote-control.types";
import { calculatePlaybackRateFromSpeed, getPlaylistNavigation, multiplyPerceptualFPS, tapsToBrightness } from "@/utils/web-client.util";
import { toast } from "react-toastify";
import useSocket from "@/hooks/useSocket";
import { NEW_REMOTE_CONTROL_EVENT, REMOTE_CONTROLS } from "@/constants/remote-control.constants";
import { CREDIT_OVERLAY_ID, IS_WEB_CLIENT_ACTIVE } from "@/constants/web-client.constants";
import { useVideoJSOverlay } from "@/hooks/useVideoJSOverlay";
import { HistoryItem, PlaylistDirection, PlaylistNavigation, SpeedControls, SpeedLevels } from "@/types/web-client.types";
import { LONG_CROSSFADE_DURATION, VIDEOJS_EVENTS } from "@/constants/video-js.constants";
import { useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import { useTranslation } from "react-i18next";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import { fetchDream } from "@/api/dream/query/useDream";
import { joinPaths } from "@/utils/router.util";
import { setCurrentUserDreamOptimistically } from "@/api/dream/utils/dream-utils";

type WebClientContextType = {
  isWebClientActive: boolean;
  isWebClientAvailable: boolean;
  playingDream?: Dream;
  handlers: Record<RemoteEvent, () => void>;
  setWebClientActive: (isActive: boolean) => void;
  setWebPlayerAvailable: (isActive: boolean) => void;
  handleOnEnded: () => void;
};

type NextHandlerProps = {
  longTransition?: boolean
} | unknown;

/**
 *  Web Client Context serves as a high-level controller for dream and playlist management, building upon the VideoJS Context to provide advanced playlist handling and controls. 
 *  It manages user interactions, playlist navigation, dream transitions, video overlays, remote control events, speed, brightnes, etc.
 */
export const WebClientContext = createContext<WebClientContextType>(
  {} as WebClientContextType,
);

export const WebClientProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { t } = useTranslation();

  // user
  const { user, currentDream: cd, refreshCurrentDream, refreshCurrentPlaylist } = useAuth()

  // videojs
  const {
    players,
    isReady,
    activePlayer,
    addEventListener,
    setBrightness: setPlayerBrightness,
    setPlaybackRate: setPlayerPlaybackRate,
    playVideo,
    preloadVideo,
    toggleFullscreen
  } = useVideoJs();

  // prev active player data to track changes
  const prevActivePlayerRef = useRef<string | null>(null);
  const playerInstance = useMemo(() => players.get(activePlayer ?? ''), [players, activePlayer]);

  // socket
  const { emit } = useSocket();

  // location
  const location = useLocation();

  // overlay
  const { showOverlay, hideOverlay } = useVideoJSOverlay(playerInstance?.player ? [playerInstance.player] : []);

  // dream and playlist values
  const playingDreamRef = useRef<Dream>();
  const playingPlaylistRef = useRef<Playlist>();
  // playlist navigation state
  const playlistNavigationRef = useRef<PlaylistNavigation>();
  const playlistHistoryPositionRef = useRef<number>(0);
  // played dreams to control dreams concatenation -> https://github.com/e-dream-ai/client/issues/89
  const historyRef = useRef<Array<HistoryItem>>([]);
  const showCreditOverlayRef = useRef(false);
  // used to prevent multiple calls to handlers.next() on automatic video change
  const transitioningRef = useRef(false);

  // user current values
  const currentDream = useMemo(() => cd, [cd]);

  const { data: currentPlaylistData } = useCurrentPlaylist();

  const currentPlaylist = useMemo(() => {
    const playlist = currentPlaylistData?.data?.playlist;
    // ensure items order
    if (playlist?.items) {
      playlist.items.sort((a, b) => a.order - b.order);
    }

    return playlist;
  }, [currentPlaylistData]);

  /** 
   * indicates if the web player is currently active
   */
  const [isWebClientActive, setIsWebClientActive] = useState<boolean>(false);
  /** 
   * indicates if the web client play button can be shown to the user
   */
  const [isWebClientAvailable, setIsWebClientAvailable] = useState<boolean>(false);
  const { isActive } = useDesktopClient();


  // player states
  const [, setPaused] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(() => calculatePlaybackRateFromSpeed(8, 1));
  const [brightness, setBrightness] = useState<number>(40);

  const setWebClientActive = useCallback((isActive: boolean) => {
    setIsWebClientActive(isActive);
  }, []);

  const setWebPlayerAvailable = useCallback((isActive: boolean) => {
    setIsWebClientAvailable(isActive)
  }, []);

  const updateCreditOverlay = useCallback(() => {
    // hide overlay if is already showing one
    hideOverlay(CREDIT_OVERLAY_ID);

    const dreamName = playingDreamRef.current?.name ?? playingDreamRef.current?.uuid;
    const artist = playingDreamRef.current?.displayedOwner?.name ?? playingDreamRef.current?.user?.name;
    const playlist = playingPlaylistRef.current?.name ?? playingPlaylistRef.current?.uuid;

    // update overlay with new content
    const overlayContent = `
        <div>
          ${dreamName ? `<div>title: ${dreamName}</div>` : ""}
          ${artist ? `<div>artist: ${artist}</div>` : ""}
          ${playlist ? `<div>playlist: ${playlist}</div>` : ""}
        </div>
      `;

    showOverlay({
      id: CREDIT_OVERLAY_ID,
      content: overlayContent,
    });
  }, [showOverlay, hideOverlay]);

  const toggleCreditOverlay = useCallback(() => {
    if (showCreditOverlayRef.current) {
      hideOverlay(CREDIT_OVERLAY_ID);
      showCreditOverlayRef.current = false;
    } else {
      updateCreditOverlay();
      showCreditOverlayRef.current = true;
    }
  }, [updateCreditOverlay, hideOverlay]);

  // get next dream to play having direction
  const getNextDream = useCallback((direction: PlaylistDirection) => {
    return playlistNavigationRef?.current?.[direction];
  }, []);

  const addDreamToHistory = useCallback((dream: Dream, wasConcatenated: boolean) => {
    // add dream to played dreams array if is not included

    if (!historyRef.current.some(pd => dream.uuid === pd.dream.uuid)) {
      historyRef.current.push({ dream, wasConcatenated });
      return true;
    }
    return false;
  }, []);

  const resetHistory = useCallback(() => {
    historyRef.current = []
    playlistHistoryPositionRef.current = 0;
  }, []);

  /**
   * Preloads navigation videos.
   */
  const preloadNavigationVideos = useCallback((navigation: PlaylistNavigation) => {
    if (navigation.previous?.video) preloadVideo(navigation.previous.video);
    if (navigation.next?.video) preloadVideo(navigation.next.video);
  }, [preloadVideo]);

  /**
   * Updates playlist navigation into playlistNavigationRef. 
   * Obtains next and previous dream in the playlist. Calculates isNextConcatenated value too.
   */
  const updatePlaylistNavigation = useCallback(() => {
    const navigation = getPlaylistNavigation({
      playingDream: playingDreamRef.current,
      playingPlaylist: playingPlaylistRef?.current,
      history: historyRef.current,
      historyPosition: playlistHistoryPositionRef.current
    });

    playlistNavigationRef.current = navigation;

    if (navigation.allDreamsPlayed) {
      resetHistory();
    }

    console.log("previous", navigation.previous?.uuid);
    console.log("next", navigation.next?.uuid);

    preloadNavigationVideos(navigation);
  }, [preloadNavigationVideos, resetHistory]);

  // plays dream and updates state
  const playDream = useCallback(
    async (
      dreamToPlay?: Dream | null,
      options: { skipCrossfade: boolean, longTransition: boolean } = { skipCrossfade: false, longTransition: false }
    ) => {
      if (!dreamToPlay?.video) return false;
      // playing log
      console.log("-----");
      console.log("playing", dreamToPlay.uuid);

      playingDreamRef.current = dreamToPlay;
      const played = await playVideo(dreamToPlay.video, options);

      // if video was not played return false
      // played log
      console.log("played", played);
      if (!played) {
        return false;
      }

      emit(NEW_REMOTE_CONTROL_EVENT, {
        event: "playing",
        uuid: dreamToPlay.uuid,
        isWebClientEvent: true,
      });

      setCurrentUserDreamOptimistically(dreamToPlay);

      return true;
    }, [emit, playVideo]);

  // used to play dreams that are not handled by navigation events (next/prev) 
  const playDreamWithHistory = useCallback(async (dream?: Dream) => {
    if (!dream) return;
    await playDream(dream);
    // add dream to played dreams
    const added = addDreamToHistory(dream, false);

    if (added) {
      // set position at last item
      playlistHistoryPositionRef.current = historyRef.current.length - 1;
    } else {
      // find position on played dreams
      playlistHistoryPositionRef.current = Math.max(historyRef.current.findIndex(h => h.dream.uuid === dream.uuid), 0);
    }
    updatePlaylistNavigation();
  }, [playDream, addDreamToHistory, updatePlaylistNavigation]);

  const handlePlaylistControl = useCallback(async (direction: PlaylistDirection, longTransition: boolean = false) => {
    const dream = getNextDream(direction)

    if (!dream) return false;
    if (transitioningRef.current) return false;

    transitioningRef.current = true;

    const isNextConcatenated = Boolean(playlistNavigationRef.current?.isNextConcatenated);

    const played = await playDream(
      dream,
      {
        skipCrossfade: isNextConcatenated,
        longTransition: longTransition
      });

    // +1 on history position if direction is next and there's one played dream at least
    if (direction === PlaylistDirection.NEXT && played && historyRef.current.length) {
      playlistHistoryPositionRef.current += 1;
    }
    // -1 on history position if direction is previous, prevent negative numbers
    else if (direction === PlaylistDirection.PREVIOUS && played) {
      playlistHistoryPositionRef.current = Math.max(playlistHistoryPositionRef.current - 1, 0);
    }

    // add dream to played dreams
    addDreamToHistory(dream, isNextConcatenated);

    if (played) {
      updatePlaylistNavigation();
    }

    transitioningRef.current = false;

    return played;
  }, [playDream, getNextDream, updatePlaylistNavigation, addDreamToHistory]);

  const setSpeed = useCallback((speed: number) => {
    const playbackRate = calculatePlaybackRateFromSpeed(speed, playingDreamRef?.current?.activityLevel);
    setPlayerPlaybackRate(playbackRate);
    setPlaybackRate(playbackRate);
  }, [setPlayerPlaybackRate]);

  const speedControls = (Object.fromEntries(
    Array.from({ length: 9 }, (_, i) => [
      `set_speed_${i + 1}`,
      () => setSpeed((i + 1) as SpeedLevels)
    ])
  ) as SpeedControls);

  const handlers: Record<RemoteEvent, (options?: unknown) => void> = useMemo(() => ({
    playback_slower: () => {
      const newPlaybackRate = multiplyPerceptualFPS(1 / 1.1224, playbackRate);
      setPlaybackRate(newPlaybackRate);
      setPlayerPlaybackRate(newPlaybackRate);
    },
    playback_faster: () => {
      const newPlaybackRate = multiplyPerceptualFPS(1.1224, playbackRate);
      setPlaybackRate(newPlaybackRate);
      setPlayerPlaybackRate(newPlaybackRate);
    },
    brighter: () => {
      const newBrightness = brightness + 1;
      setPlayerBrightness(tapsToBrightness(brightness));
      setBrightness(newBrightness);
    },
    darker: () => {
      const newBrightness = brightness - 1;
      setPlayerBrightness(tapsToBrightness(brightness));
      setBrightness(newBrightness);
    },
    pause: () => {
      // handle pause
      const isPaused = playerInstance?.player?.paused();
      if (isPaused) {
        playerInstance?.player?.play();
      } else {
        playerInstance?.player?.pause();
      }
      setPaused(!isPaused);
    },
    playing: () => { },
    play_dream: () => { },
    play_playlist: () => { },
    like: () => { },
    dislike: () => { },
    like_current_dream: () => { },
    dislike_current_dream: () => { },
    previous: async () => handlePlaylistControl(PlaylistDirection.PREVIOUS),
    // @ts-expect-error options?.longTransition exists 
    next: async (options?: NextHandlerProps) => handlePlaylistControl(PlaylistDirection.NEXT, options?.longTransition),
    forward: () => {
      if (playerInstance?.player) {
        const currentTime = playerInstance?.player.currentTime() ?? 0;
        // 10 seconds
        playerInstance?.player.currentTime(currentTime + 10);
      }
    },
    backward: () => {
      if (playerInstance?.player) {
        const currentTime = playerInstance?.player.currentTime() ?? 0;
        // 10 seconds
        playerInstance?.player.currentTime(Math.max(0, currentTime - 10));
      }
    },
    credit: () => {
      toggleCreditOverlay();
    },
    web: () => {
      window.open(
        joinPaths(
          [
            import.meta.env.VITE_FRONTEND_URL,
            ROUTES.VIEW_DREAM,
            playingDreamRef?.current?.uuid
          ]
        ), "_blank");
    },
    help: () => { },
    status: () => { },
    capture: () => { },
    report: () => { },
    reset_playlist: () => { },
    fullscreen: () => {
      toggleFullscreen();
    },
    ...speedControls
  }), [
    playerInstance,
    playbackRate,
    brightness,
    speedControls,
    setPlayerBrightness,
    toggleCreditOverlay,
    toggleFullscreen,
    handlePlaylistControl,
    setPlayerPlaybackRate,
  ]);

  // handles when a video ends playing
  const handleOnEnded = useCallback(() => {
    handlePlaylistControl(PlaylistDirection.NEXT);
  }, [handlePlaylistControl]);

  // Listen new remote control events from the server
  useSocketEventListener<RemoteControlEventData>(
    NEW_REMOTE_CONTROL_EVENT,
    async (data?: RemoteControlEventData) => {
      const event = data?.event as RemoteEvent;
      if (!event) {
        return;
      }

      // execute handler synced with event
      handlers?.[event]?.();

      /**
       * Handle dream events
       */
      if (event === REMOTE_CONTROLS.PLAY_DREAM.event) {
        const newDream = await fetchDream(data?.uuid)
        // if there's a dream play it
        playDreamWithHistory(newDream);
      }

      if (event === REMOTE_CONTROLS.PLAYING.event) {
        refreshCurrentDream();
      }

      /**
       * Handle playlist events
       */
      if (event === REMOTE_CONTROLS.PLAY_PLAYLIST.event) {
        const playlist = await refreshCurrentPlaylist();
        const newDream = playlist?.items?.find(i => Boolean(i.dreamItem))?.dreamItem;

        // if there's a dream play it and reset history
        if (newDream) {
          resetHistory();
          playDreamWithHistory(newDream);
        }
      }

      if (event === REMOTE_CONTROLS.RESET_PLAYLIST.event) {
        refreshCurrentPlaylist();
      }

    },
  );

  useStatusCallback(isActive, {
    onActive: () => {
      if (IS_WEB_CLIENT_ACTIVE && user) {
        setIsWebClientAvailable(false);
      }
    },
    onInactive: () => {
      if (IS_WEB_CLIENT_ACTIVE && user) {
        setIsWebClientAvailable(true);
      }
    },
  });

  // register events on videojs instance
  useEffect(() => {
    const handleTimeUpdate = async () => {
      const remainingTime = Number(playerInstance?.player?.remainingTime());

      if (Number.isNaN(remainingTime)) return;

      // start transition when we reach threshold
      if (
        // verify if should start a native transition
        remainingTime <= LONG_CROSSFADE_DURATION
        // if is a concatenated transition, do not run a long transition
        && !playlistNavigationRef.current?.isNextConcatenated
        // verify transition lock state
        && !transitioningRef.current
      ) {
        // lock transitioning and wait for the change
        await handlers.next({ longTransition: true });
      }
    }

    // ended event just in case TIMEUPDATE is skipped (i.e. a concatenated kf)
    const handleEnded = async () => {
      // lock transitioning and wait for the change
      await handlers.next();

    }

    const cleanup1 = addEventListener(VIDEOJS_EVENTS.TIMEUPDATE, handleTimeUpdate);
    const cleanup2 = addEventListener(VIDEOJS_EVENTS.ENDED, handleEnded);

    return () => {
      cleanup1();
      cleanup2();
    };
  }, [playerInstance, handlers, addEventListener]);

  // hook to update credit overlay after dream changed
  useEffect(() => {
    if (activePlayer !== prevActivePlayerRef.current) {
      // update prevActivePlayerRef value
      prevActivePlayerRef.current = activePlayer;

      // if showCreditOverlay update overlay
      if (showCreditOverlayRef.current) {
        updateCreditOverlay();
      }
    }
  }, [activePlayer, updateCreditOverlay])

  // play current dream when user comes back to remote control page or isWebClientActive first time
  useEffect(() => {
    // if pathname is RC and isWebClientActive, then play current dream
    if (
      // location should be remote control
      location.pathname === ROUTES.REMOTE_CONTROL
      // videojs instances should be ready
      && isReady
      // web client should be active
      && isWebClientActive
      // should be a dream with the video source
      && playingDreamRef.current?.video
    ) {
      playDreamWithHistory(playingDreamRef.current)
    }
  }, [location.pathname, isReady, isWebClientActive, playDreamWithHistory]);

  // if there's a current dream, set it as playing dream and preload it
  useEffect(() => {
    if (currentDream) {
      playingDreamRef.current = currentDream;
      preloadVideo(currentDream.video);
    }
  }, [currentDream, preloadVideo]);

  // update playing playlist ref
  useEffect(() => {
    // if same playlist, skip
    if (playingPlaylistRef.current?.uuid === currentPlaylist?.uuid) {
      return
    }
    // update playingPlaylistRef playlist
    playingPlaylistRef.current = currentPlaylist;
  }, [currentPlaylist]);

  // show web client available toast
  useEffect(() => {
    // if pathname is RC and isWebClientAvailable but not isWebClientActive, then show toast
    if (location.pathname === ROUTES.REMOTE_CONTROL && !isWebClientActive && isWebClientAvailable) {
      toast.info(t("web_client.web_client_available"));
    }
  }, [t, location.pathname, isWebClientActive, isWebClientAvailable]);

  const memoedValue = useMemo(
    () => ({
      isWebClientActive,
      isWebClientAvailable,
      playingDream: playingDreamRef.current,
      handlers,
      setWebClientActive,
      setWebPlayerAvailable,
      handleOnEnded
    }),
    [
      isWebClientActive,
      isWebClientAvailable,
      handlers,
      setWebClientActive,
      setWebPlayerAvailable,
      handleOnEnded
    ],
  );

  return (
    <WebClientContext.Provider value={memoedValue}>{children}</WebClientContext.Provider>
  );
};

export default WebClientContext;
