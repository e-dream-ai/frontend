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
import { useVideoJs } from "@/hooks/useVideoJS";
import { RemoteControlEventData, RemoteEvent } from "@/types/remote-control.types";
import { calculatePlaybackRateFromSpeed, getPlaylistNavigation, multiplyPerceptualFPS, tapsToBrightness } from "@/utils/web-client.util";
import useSocket from "@/hooks/useSocket";
import { NEW_REMOTE_CONTROL_EVENT, REMOTE_CONTROLS } from "@/constants/remote-control.constants";
import { CREDIT_OVERLAY_ID } from "@/constants/web-client.constants";
import { useVideoJSOverlay } from "@/hooks/useVideoJSOverlay";
import { HistoryItem, PlaylistDirection, PlaylistNavigation, SpeedControls, SpeedLevels } from "@/types/web-client.types";
import { LONG_CROSSFADE_DURATION, VIDEOJS_EVENTS } from "@/constants/video-js.constants";
import { useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import { fetchDream } from "@/api/dream/query/useDream";
import { joinPaths } from "@/utils/router.util";
import { setCurrentUserDreamOptimistically } from "@/api/dream/utils/dream-utils";
import { useUserDislikes } from "@/api/user/query/useUserDislikes";
import { useDefaultPlaylist } from "@/api/playlist/query/useDefaultPlaylist";

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
  // location
  const location = useLocation();
  // socket
  const { emit } = useSocket();
  const { currentDream, currentPlaylist, refreshCurrentDream, refreshCurrentPlaylist } = useAuth();

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
  const playerInstance = useMemo(
    () => players.find(p => p.id === activePlayer),
    [players, activePlayer]
  );

  // overlay
  const { showOverlay, hideOverlay } = useVideoJSOverlay(playerInstance?.player ? [playerInstance.player] : []);

  // Dream and playlist values
  const playingDreamRef = useRef<Dream>();
  const playingPlaylistRef = useRef<Playlist>();
  // Playlist navigation state
  const playlistNavigationRef = useRef<PlaylistNavigation>();
  const playlistHistoryPositionRef = useRef<number>(0);
  // Played dreams to control dreams concatenation -> https://github.com/e-dream-ai/client/issues/89
  const historyRef = useRef<Array<HistoryItem>>([]);
  // Disliked dreams ref
  const dislikedDreamsRef = useRef<Array<string>>([]);
  // Show credits overlay ref
  const showCreditOverlayRef = useRef(false);
  // Used to prevent multiple calls to handlers.next() on automatic video change
  const transitioningRef = useRef(false);

  /** 
   * indicates if the web player is currently active
   */
  const [isWebClientActive, setIsWebClientActive] = useState<boolean>(false);
  /** 
   * indicates if the web client play button can be shown to the user
   */
  const [isWebClientAvailable, setIsWebClientAvailable] = useState<boolean>(false);


  // player states
  const [, setPaused] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(() => calculatePlaybackRateFromSpeed(8, 1));
  const [brightness, setBrightness] = useState<number>(40);

  // API data hooks
  const { data: defaultPlaylistData } = useDefaultPlaylist();
  const { data: dislikesData } = useUserDislikes();

  const defaultPlaylistDreams = useMemo(() => defaultPlaylistData?.data?.dreams ?? [], [defaultPlaylistData])
  const dislikedDreams = useMemo(() => dislikesData?.data?.dislikes ?? [], [dislikesData])

  const setWebClientActive = useCallback((isActive: boolean) => {
    setIsWebClientActive(isActive);
  }, []);

  const setWebPlayerAvailable = useCallback((isActive: boolean) => {
    setIsWebClientAvailable(isActive)
  }, []);

  const updateCreditOverlay = useCallback(() => {
    // Hide overlay if is showing one already
    hideOverlay(CREDIT_OVERLAY_ID);

    // Early return if no current dream is playing
    if (!playingDreamRef.current) {
      return;
    }

    // Destructure playing dream and playlist values
    const {
      name = "",
      uuid = "",
      displayedOwner,
      user
    } = playingDreamRef.current;

    const {
      name: playlistName = "",
      uuid: playlistUuid = ""
    } = playingPlaylistRef.current || {};

    // Display values
    const dreamName = name || uuid;
    const artist = displayedOwner?.name || user?.name || "Unknown Artist";
    const playlist = playlistName || playlistUuid || "Default Playlist";

    // Update overlay with new content
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

  // Get next dream to play having direction
  const getNextDream = useCallback((direction: PlaylistDirection) => {
    return playlistNavigationRef?.current?.[direction];
  }, []);

  const addDreamToHistory = useCallback((dream: Dream, wasConcatenated: boolean) => {
    // Add dream to history if is not already included
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
  const preloadNavigationVideos = useCallback(async (navigation: PlaylistNavigation) => {
    if (navigation.previous?.video) {
      preloadVideo(navigation.previous.video);
    }
    if (navigation.next?.video) {
      preloadVideo(navigation.next.video);
    }
  }, [preloadVideo]);

  /**
   * Updates playlist navigation into playlistNavigationRef. 
   * Obtains next and previous dream in the playlist. Calculates isNextConcatenated value too.
   */
  const updatePlaylistNavigation = useCallback(() => {
    // Extract dreams based on available source
    const extractedDreams = playingPlaylistRef.current
      // Get dreams from the playing playlist
      ? (playingPlaylistRef.current.items ?? [])
        .filter(playlistItem => Boolean(playlistItem.dreamItem))
        .map(playlistItem => playlistItem.dreamItem!)
      // Otherwise fallbacks into the default playlist
      : defaultPlaylistDreams;

    // Filter out any disliked dreams
    const playingPlaylistDreams: Dream[] = extractedDreams.filter(
      dream => !dislikedDreamsRef.current.includes(dream.uuid)
    );

    const navigation = getPlaylistNavigation({
      playingDream: playingDreamRef.current,
      playingPlaylistDreams,
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
  }, [defaultPlaylistDreams, preloadNavigationVideos, resetHistory]);

  // plays dream and updates state
  const playDream = useCallback(
    async (
      dreamToPlay?: Dream | null,
      options: { skipCrossfade: boolean, longTransition: boolean } = { skipCrossfade: false, longTransition: false }
    ) => {
      console.log('playDream', dreamToPlay);
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
      playlistHistoryPositionRef.current = Math.max(historyRef.current.length - 1, 0);
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
    dislike_current_dream: async () => {
      if (!playingDreamRef.current) {
        return;
      }

      // Getting disliked dream uuid before playing next
      const dislikedDreamUUID = playingDreamRef.current.uuid;
      // Play next dream
      const played = await handlePlaylistControl(PlaylistDirection.NEXT);
      // await queryClient.refetchQueries([USER_DISLIKES_QUERY_KEY]);

      if (!played) {
        return
      }

      // Get disliked dream index
      const dislikedDreamIndex = historyRef.current.findIndex(h => h.dream.uuid === dislikedDreamUUID);

      // Add it to disliked dreams locally
      if (!dislikedDreamsRef.current.includes(dislikedDreamUUID)) {
        dislikedDreamsRef.current.push(dislikedDreamUUID);
      }

      // If found an index (index !== -1) remove it from history and update navigation
      if (dislikedDreamIndex !== -1) {
        historyRef.current.splice(dislikedDreamIndex, 1);
        playlistHistoryPositionRef.current = Math.max(playlistHistoryPositionRef.current - 1, 0);
        updatePlaylistNavigation();
      }
    },
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
    updatePlaylistNavigation
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

  // register events on videojs instance
  useEffect(() => {
    const handleTimeUpdate = async () => {
      const remainingTime = Number(playerInstance?.player?.remainingTime());

      if (Number.isNaN(remainingTime)) return;

      // start transition when we reach threshold
      if (
        // verify if should start a native transition
        // LONG_CROSSFADE_DURATION / 2 
        // should be triggered with half of time of the transition duration so that it takes 5 seconds in total between the two dreams?
        remainingTime <= LONG_CROSSFADE_DURATION / 2
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
      console.log('playDreamWithHistory()');
      playDreamWithHistory(playingDreamRef.current)
    }
  }, [location.pathname, isReady, isWebClientActive, playDreamWithHistory]);

  // Preload starting video
  useEffect(() => {
    if (
      // location should be remote control
      location.pathname === ROUTES.REMOTE_CONTROL
      // videojs instances should be ready
      && isReady
    ) {
      // Prioritize the current dream if it exists
      // Set it as playing dream and preload it
      if (currentDream) {
        playingDreamRef.current = currentDream;
        preloadVideo(currentDream.video);
        return;
      }

      // If no current dream, attempt to use the first dream from the default playlist
      const defaultPlaylistDream = defaultPlaylistDreams.find(d => !dislikedDreamsRef.current.includes(d.uuid));

      // Set it as playing dream and preload it
      if (defaultPlaylistDream) {
        playingDreamRef.current = defaultPlaylistDream;
        preloadVideo(defaultPlaylistDream.video);
      }
    }
  }, [location.pathname, isReady, currentDream, defaultPlaylistDreams, preloadVideo]);

  // Update playing playlist ref
  useEffect(() => {
    // If same playlist, skip
    if (playingPlaylistRef.current?.uuid === currentPlaylist?.uuid) {
      return
    }
    // Update playingPlaylistRef playlist
    playingPlaylistRef.current = currentPlaylist;
  }, [currentPlaylist]);

  // Update disliked dreams ref
  useEffect(() => {
    dislikedDreamsRef.current = dislikedDreams;
  }, [dislikedDreams]);

  // Cleans disliked dreams from history when dislikedDreams are updated
  useEffect(() => {
    historyRef.current = historyRef.current.filter(h => !dislikedDreams.includes(h.dream.uuid));
  }, [dislikedDreams]);

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
