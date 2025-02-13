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
import { PlaylistNavigation, SpeedControls, SpeedLevels } from "@/types/web-client.types";
import { CROSSFADE_DURATION, VIDEOJS_EVENTS } from "@/constants/video-js.constants";
import { useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import { useTranslation } from "react-i18next";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import { fetchDream } from "@/api/dream/query/useDream";
import { joinPaths } from "@/utils/router.util";

type WebClientContextType = {
  isWebClientActive: boolean;
  isWebClientAvailable: boolean;
  playingDream?: Dream;
  handlers: Record<RemoteEvent, () => void>;
  setWebClientActive: (isActive: boolean) => void;
  setWebPlayerAvailable: (isActive: boolean) => void;
  handleOnEnded: () => void;
};


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
    activePlayer,
    isReady,
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
  // played dreams to control dreams concatenation -> https://github.com/e-dream-ai/client/issues/89
  const playedDreamsRef = useRef<Array<string>>([]);
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
  const [playbackRate, setPlaybackRate] = useState<number>(calculatePlaybackRateFromSpeed(8, 1));
  const [brightness, setBrightness] = useState<number>(40);

  const setWebClientActive = useCallback((isActive: boolean) => {
    setIsWebClientActive(isActive);
    if (isActive && currentDream) {
      // if there's a current dream, set it as playing dream and preload it
      playingDreamRef.current = currentDream;
      preloadVideo(currentDream.video);
    }
  }, [currentDream, setIsWebClientActive, preloadVideo]);

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
  const getNextDream = useCallback((direction: 'next' | 'previous') => {
    return playlistNavigationRef?.current?.[direction];
  }, []);

  // updates playlist navigation
  const updatePlaylistNavigation = useCallback(() => {
    const navigation = getPlaylistNavigation({
      playingDream: playingDreamRef.current,
      playingPlaylist: playingPlaylistRef?.current,
      playedDreams: playedDreamsRef.current
    });

    playlistNavigationRef.current = navigation;

    if (navigation.previous?.video) {
      preloadVideo(navigation.previous.video);
    }
    if (navigation.next?.video) {
      preloadVideo(navigation.next.video);
    }
  }, [preloadVideo]);

  // plays dream and updates state
  const playDream = useCallback(async (dreamToPlay?: Dream | null, options: { skipCrossfade: boolean } = { skipCrossfade: false }) => {
    if (!dreamToPlay?.video) return false;

    playingDreamRef.current = dreamToPlay;
    const played = await playVideo(dreamToPlay.video, options);

    // if video was not played return false
    if (!played) {
      return false;
    }

    // add dream to played dreams array if is not included
    if (!playedDreamsRef.current.includes(dreamToPlay.uuid)) {
      playedDreamsRef.current.push(dreamToPlay.uuid);
    }
    
    // reset played dreams  
    if (playedDreamsRef.current.length === playingPlaylistRef.current?.items?.filter(pi => Boolean(pi.dreamItem)).length) {
      playedDreamsRef.current = []
    }

    emit(NEW_REMOTE_CONTROL_EVENT, {
      event: "playing",
      uuid: dreamToPlay.uuid,
      isWebClientEvent: true,
    });

    refreshCurrentDream();

    return true;
  }, [emit, playVideo, refreshCurrentDream]);

  const handlePlaylistControl = useCallback(async (direction: 'next' | 'previous') => {
    const dream = getNextDream(direction)
    const played = await playDream(
      dream,
      {
        skipCrossfade: playlistNavigationRef.current?.isNextConcatenated ?? false
      });

    if (played) {
      updatePlaylistNavigation();
    }

    return played;
  }, [playDream, getNextDream, updatePlaylistNavigation]);

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

  const handlers: Record<RemoteEvent, () => void> = useMemo(() => ({
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
    previous: async () => handlePlaylistControl('previous'),
    next: async () => handlePlaylistControl('next'),
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
    handlePlaylistControl("next");
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
        Boolean(newDream) && playDream(newDream);
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
        // if there's a dream play it
        Boolean(newDream) && playDream(newDream);
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

  // play current dream when playerjs is ready
  useEffect(() => {
    if (!isReady || !playingDreamRef.current) return;

    // play dream fn handler
    const handlePlayDream = async () => {
      const played = await playDream(playingDreamRef.current);
      if (played) updatePlaylistNavigation();
    };

    handlePlayDream();
  }, [isReady, playDream, updatePlaylistNavigation]);

  // update playing playlist
  useEffect(() => {
    // update playingPlaylistRef playlist
    if (currentPlaylist) {
      playingPlaylistRef.current = currentPlaylist;
    }

    // when currentPlaylist changes play first dream 
    const firstPlaylistDream = currentPlaylist?.items?.[0]?.dreamItem;
    if (isWebClientActive && firstPlaylistDream) {
      playDream(firstPlaylistDream);
    }
  }, [currentPlaylist, isWebClientActive, playDream]);

  // register events on videojs instance
  useEffect(() => {
    const cleanup1 = addEventListener(VIDEOJS_EVENTS.TIMEUPDATE, async () => {
      const remainingTime = Number(playerInstance?.player?.remainingTime());

      if (Number.isNaN(remainingTime)) {
        return;
      }

      // start transition when we reach threshold
      if (remainingTime <= CROSSFADE_DURATION && !transitioningRef.current) {
        // lock transitioning and wait for the change
        transitioningRef.current = true;
        await handlers.next();
        transitioningRef.current = false;
      }
    });

    // ended event just in case TIMEUPDATE didn't work
    const cleanup2 = addEventListener(VIDEOJS_EVENTS.ENDED, async () => {
      // lock transitioning and wait for the change
      transitioningRef.current = true;
      await handlers.next();
      transitioningRef.current = false;
    });

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

  // play current dream when user comes back to remote control page
  useEffect(() => {
    // if pathname is RC and isWebClientActive, then play current dream
    if (location.pathname === ROUTES.REMOTE_CONTROL && isWebClientActive && playingDreamRef.current?.video) {
      // play current dream
      playDream(playingDreamRef.current);
    }
  }, [location, isWebClientActive, playDream]);

  // show web client available toast
  useEffect(() => {
    // if pathname is RC and isWebClientAvailable but not isWebClientActive, then show toast
    if (location.pathname === ROUTES.REMOTE_CONTROL && !isWebClientActive && isWebClientAvailable) {
      toast.info(t("web_client.web_client_available"));
    }
  }, [t, location, isWebClientActive, isWebClientAvailable]);

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
