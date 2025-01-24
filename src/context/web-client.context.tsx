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
import { NEW_REMOTE_CONTROL_EVENT } from "@/constants/remote-control.constants";
import { CREDIT_OVERLAY_ID, IS_WEB_CLIENT_ACTIVE } from "@/constants/web-client.constants";
import { useVideoJSOverlay } from "@/hooks/useVideoJSOverlay";
import { SpeedControls, SpeedLevels } from "@/types/web-client.types";
import { TRANSITION_THRESHOLD, VIDEOJS_EVENTS } from "@/constants/video-js.constants";
import { useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes.constants";
import { useTranslation } from "react-i18next";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import { fetchDream } from "@/api/dream/query/useDream";

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
  const { user, updateCurrentDream } = useAuth()

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
  const showCreditOverlayRef = useRef(false);
  // used to prevent multiple calls to handlers.next() on automatic video change
  const transitioningRef = useRef(false);

  // user current values
  const currentDream = useMemo(() => user?.currentDream, [user?.currentDream]);

  const { data: currentPlaylistData } = useCurrentPlaylist();
  const currentPlaylist = useMemo(() => currentPlaylistData?.data?.playlist, [currentPlaylistData]);

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
    const { [direction]: targetDream } = getPlaylistNavigation(
      playingDreamRef.current,
      playingPlaylistRef?.current
    );
    return targetDream?.dreamItem ?? playingPlaylistRef?.current?.items?.[0]?.dreamItem;
  }, []);

  // plays dream and updates state
  const playDream = useCallback(async (dreamToPlay?: Dream) => {
    if (!dreamToPlay?.video) return false;

    playingDreamRef.current = dreamToPlay;
    const played = await playVideo(dreamToPlay.video);

    // if video was not played return false
    if (!played) {
      return false;
    }

    updateCurrentDream();
    emit(NEW_REMOTE_CONTROL_EVENT, {
      event: "playing",
      uuid: dreamToPlay.uuid,
      isWebClientEvent: true,
    });

    // get next dream after being update to preload it into a player instance
    const dreamToPreload = getNextDream("next");

    if (dreamToPreload?.video) {
      preloadVideo(dreamToPreload.video)
    }

    return true;
  }, [emit, playVideo, preloadVideo, getNextDream, updateCurrentDream]);

  const handlePlaylistControl = useCallback(async (direction: 'next' | 'previous') => {
    return playDream(getNextDream(direction));
  }, [playDream, getNextDream]);

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
      window.open(import.meta.env.VITE_FRONTEND_URL, "_blank");
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

      if (event === "play_dream") {
        const newDream = await fetchDream(data?.uuid)
        // if there's a dream play it
        Boolean(newDream) && playDream(newDream);
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
    if (isReady && playingDreamRef.current) {
      playVideo(playingDreamRef.current.video);
    }
  }, [isReady, playVideo]);

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
      if (remainingTime <= TRANSITION_THRESHOLD && !transitioningRef.current) {
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
      playVideo(playingDreamRef.current.video);
    }
  }, [location, isWebClientActive, playVideo]);

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
