import useAuth from "@/hooks/useAuth";
import { useDesktopClient } from "@/hooks/useDesktopClient";
import useStatusCallback from "@/hooks/useStatusCallback";
import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import { useVideoJs } from "@/hooks/useVideoJS";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";
import { RemoteEvent } from "@/types/remote-control.types";
import { calculatePlaybackRateFromSpeed, getPlaylistNavigation, multiplyPerceptualFPS, tapsToBrightness } from "@/utils/web-client.util";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import useSocket from "@/hooks/useSocket";
import { NEW_REMOTE_CONTROL_EVENT } from "@/constants/remote-control.constants";
import { CREDIT_OVERLAY_ID, IS_WEB_CLIENT_ACTIVE } from "@/constants/web-client.constants";
import { useVideoJSOverlay } from "@/hooks/useVideoJSOverlay";
import { SpeedControls, SpeedLevels } from "@/types/web-client.types";

type WebClientContextType = {
  isWebClientActive: boolean;
  isWebClientAvailable: boolean;
  playingDream?: Dream;
  handlers: Record<RemoteEvent, () => void>;
  setWebClientActive: (isActive: boolean) => void;
  setWebPlayerAvailable: (isActive: boolean) => void;
  handleOnEnded: () => void;
};

export const WebClientContext = createContext<WebClientContextType>(
  {} as WebClientContextType,
);

export const WebClientProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  // user
  const { user, updateCurrentDream } = useAuth()

  // videojs
  const { player, isReady, setBrightness: setVideoJSBrightness, playVideo, toggleFullscreen } = useVideoJs();

  // socket
  const { emit } = useSocket();

  // overlay
  const { showOverlay, hideOverlay } = useVideoJSOverlay(player);

  // dream and playlist values
  const playingDreamRef = useRef<Dream>();
  const playingPlaylistRef = useRef<Playlist>();

  // user current values
  const currentDream = useMemo(() => user?.currentDream, [user?.currentDream]);

  const { data } = usePlaylist(user?.currentPlaylist?.uuid);
  const currentPlaylist = data?.data?.playlist;

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
  const [showCreditOverlay, setShowCreditOverlay] = useState<boolean>(false);

  const setWebClientActive = useCallback((isActive: boolean) => {
    setIsWebClientActive(isActive);
    if (isActive) {
      playingDreamRef.current = currentDream;
    }
  }, [currentDream, setIsWebClientActive]);

  const setWebPlayerAvailable = useCallback((isActive: boolean) => {
    setIsWebClientAvailable(isActive)
  }, []);

  const updateCreditOverlay = useCallback(() => {
    // hide overlay if is already showing one
    hideOverlay(CREDIT_OVERLAY_ID);

    // update overlay with new content
    const overlayContent = `
        <div>
          <div>${playingDreamRef.current?.name ?? playingDreamRef.current?.uuid ?? 'No dream playing'}</div>
          <div>${playingDreamRef.current?.displayedOwner?.name ?? playingDreamRef.current?.user?.name ?? ''}</div>
        </div>
      `;

    showOverlay({
      id: CREDIT_OVERLAY_ID,
      content: overlayContent,
    });
  }, [showOverlay, hideOverlay]);

  const toggleCreditOverlay = useCallback(() => {
    if (showCreditOverlay) {
      hideOverlay(CREDIT_OVERLAY_ID);
      setShowCreditOverlay(false);
    } else {
      updateCreditOverlay();
      setShowCreditOverlay(true);
    }
  }, [showCreditOverlay, updateCreditOverlay, hideOverlay]);

  // get next dream to play having direction
  const getNextDream = useCallback((direction: 'next' | 'previous') => {
    const { [direction]: targetDream } = getPlaylistNavigation(
      playingDreamRef.current,
      playingPlaylistRef?.current
    );
    return targetDream?.dreamItem ?? playingPlaylistRef?.current?.items?.[0]?.dreamItem;
  }, []);

  // plays dream and updates state
  const playDream = useCallback((dreamToPlay?: Dream) => {
    if (!dreamToPlay?.video) return;

    playingDreamRef.current = dreamToPlay;
    playVideo(dreamToPlay.video);
    emit(NEW_REMOTE_CONTROL_EVENT, {
      event: "playing",
      uuid: dreamToPlay.uuid
    });
    updateCurrentDream(dreamToPlay);

    if (showCreditOverlay) {
      updateCreditOverlay();
    }
  }, [showCreditOverlay, emit, playVideo, updateCurrentDream, updateCreditOverlay]);

  const handlePlaylistControl = useCallback((direction: 'next' | 'previous') => {
    playDream(getNextDream(direction));
  }, [playDream, getNextDream]);

  const setSpeed = useCallback((speed: number) => {
    const playbackRate = calculatePlaybackRateFromSpeed(speed, playingDreamRef?.current?.activityLevel);
    player.current?.playbackRate(playbackRate);
    setPlaybackRate(playbackRate);
  }, [player]);

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
      player.current?.playbackRate(newPlaybackRate);
    },
    playback_faster: () => {
      const newPlaybackRate = multiplyPerceptualFPS(1.1224, playbackRate);
      setPlaybackRate(newPlaybackRate);
      player.current?.playbackRate(newPlaybackRate);
    },
    brighter: () => {
      const newBrightness = brightness + 1;
      setVideoJSBrightness(tapsToBrightness(brightness));
      setBrightness(newBrightness);
    },
    darker: () => {
      const newBrightness = brightness - 1;
      setVideoJSBrightness(tapsToBrightness(brightness));
      setBrightness(newBrightness);
    },
    pause: () => {
      // handle pause
      const isPaused = player.current?.paused();
      if (isPaused) {
        player.current?.play();
      } else {
        player.current?.pause();
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
    previous: () => {
      handlePlaylistControl('previous');
    },
    next: () => {
      handlePlaylistControl('next');
    },
    forward: () => {
      if (player.current) {
        const currentTime = player.current.currentTime() ?? 0;
        // 10 seconds
        player.current.currentTime(currentTime + 10);
      }
    },
    backward: () => {
      if (player.current) {
        const currentTime = player.current.currentTime() ?? 0;
        // 10 seconds
        player.current.currentTime(Math.max(0, currentTime - 10));
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
    player,
    playbackRate,
    brightness,
    speedControls,
    setVideoJSBrightness,
    toggleCreditOverlay,
    toggleFullscreen,
    handlePlaylistControl,
    // setSpeed,
  ]);

  // handles when a video ends playing
  const handleOnEnded = useCallback(() => {
    const { next } = getPlaylistNavigation(playingDreamRef.current, currentPlaylist);
    const dreamToPlay = next?.dreamItem ?? currentPlaylist?.items?.[0]?.dreamItem;
    if (dreamToPlay && dreamToPlay.video) {
      playVideo(dreamToPlay.video);
      playingDreamRef.current = dreamToPlay;
      updateCurrentDream(dreamToPlay);
      emit(NEW_REMOTE_CONTROL_EVENT, { event: "playing", uuid: dreamToPlay.uuid })
    }
  }, [emit, playVideo, updateCurrentDream, currentPlaylist]);

  useStatusCallback(isActive, {
    onActive: () => {
      if (IS_WEB_CLIENT_ACTIVE && user) {
        setIsWebClientAvailable(false);
      }
    },
    onInactive: () => {
      if (IS_WEB_CLIENT_ACTIVE && user) {
        toast.info("Desktop client is inactive, you're able to play something on the web client clicking play button.");
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
    if (currentPlaylist) {
      playingPlaylistRef.current = currentPlaylist;
    }
  }, [currentPlaylist]);

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
