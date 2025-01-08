import useAuth from "@/hooks/useAuth";
import { useDesktopClient } from "@/hooks/useDesktopClient";
import useStatusCallback from "@/hooks/useStatusCallback";
import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import { useVideoJs } from "@/hooks/useVideoJS";
import { Dream } from "@/types/dream.types";
import { RemoteEvent } from "@/types/remote-control.types";
import { findCurrentBrightnessKey, findCurrentSpeedKey, getPlaylistNavigation } from "@/utils/web-client.util";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import Player from 'video.js/dist/types/player';
import useSocket from "@/hooks/useSocket";
import { NEW_REMOTE_CONTROL_EVENT } from "@/constants/remote-control.constants";
import { BRIGHTNESS, SPEEDS } from "@/constants/web-client.constants";
import { BrightnessKey, SpeedKey } from "@/types/web-client.types";

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

const setupOverlay = (player: Player | null, overlayContent: string) => {
  // custom styles
  const style = document.createElement('style');
  style.textContent = `
    .video-js-overlay {
      position: absolute;
      bottom: 40px;
      left: 20px;
      color: white;
      font-size: 20px;
    }
  `;
  document.head.appendChild(style);

  // Create and add overlay
  const overlay = document.createElement('div');
  overlay.innerHTML = overlayContent;
  player?.el().appendChild(overlay);
};

export const WebClientProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  // user
  const { user } = useAuth()

  // videojs
  const { player, isReady, setBrightness: setVideoJSBrightness, playVideo } = useVideoJs();

  // socket
  const { emit } = useSocket();

  // user current values
  const currentDream = user?.currentDream;

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
  const playingDreamRef = useRef<Dream>();


  // player states
  const [, setPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(SPEEDS[4]);
  const [brightness, setBrightness] = useState<number>(BRIGHTNESS[4]);

  const setWebClientActive = useCallback((isActive: boolean) => {
    setIsWebClientActive(isActive);
    if (isActive) {
      playingDreamRef.current = currentDream;
    }
  }, [currentDream, setIsWebClientActive]);

  const setWebPlayerAvailable = useCallback((isActive: boolean) => {
    setIsWebClientAvailable(isActive)
  }, []);

  const handlers: Record<RemoteEvent, () => void> = useMemo(() => ({
    playback_slower: () => {
      const currentKey = parseInt(findCurrentSpeedKey(speed, SPEEDS));
      if (currentKey > 0) {
        const newKey = currentKey - 1 as SpeedKey;
        setSpeed(SPEEDS[newKey]);
        player.current?.playbackRate(SPEEDS[newKey]);
      }
    },
    playback_faster: () => {
      const currentKey = parseInt(findCurrentSpeedKey(speed, SPEEDS));
      if (currentKey < 9) {
        const newKey = currentKey + 1 as SpeedKey;
        setSpeed(SPEEDS[newKey]);
        player.current?.playbackRate(SPEEDS[newKey]);
      }
    },
    brighter: () => {
      const currentKey = parseInt(findCurrentBrightnessKey(brightness, BRIGHTNESS));
      if (currentKey < 9) {
        const newKey = currentKey + 1 as BrightnessKey;
        setBrightness(BRIGHTNESS[newKey]);
        setVideoJSBrightness(BRIGHTNESS[newKey]);
      }
    },
    darker: () => {
      const currentKey = parseInt(findCurrentBrightnessKey(brightness, BRIGHTNESS));
      if (currentKey > 0) {
        const newKey = currentKey - 1 as BrightnessKey;
        setBrightness(BRIGHTNESS[newKey]);
        setVideoJSBrightness(BRIGHTNESS[newKey]);
      }
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
      const { previous } = getPlaylistNavigation(playingDreamRef.current, currentPlaylist);
      const dreamToPlay = previous?.dreamItem ?? currentPlaylist?.items?.[0]?.dreamItem;
      if (dreamToPlay) {
        playVideo(dreamToPlay?.video);
        playingDreamRef.current = dreamToPlay;
        emit(NEW_REMOTE_CONTROL_EVENT, { event: "playing", uuid: dreamToPlay.uuid })
      }
    },
    next: () => {
      const { next } = getPlaylistNavigation(playingDreamRef.current, currentPlaylist);
      const dreamToPlay = next?.dreamItem ?? currentPlaylist?.items?.[0]?.dreamItem;
      if (dreamToPlay) {
        playVideo(dreamToPlay?.video);
        playingDreamRef.current = dreamToPlay;
        emit(NEW_REMOTE_CONTROL_EVENT, { event: "playing", uuid: dreamToPlay.uuid })
      }
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
      const overlayContent = `
        <div class="video-js-overlay">
          <div class="overlay-title">${playingDreamRef.current?.name ?? playingDreamRef.current?.uuid ?? 'No dream playing'}</div>
          <div class="overlay-title">${playingDreamRef.current?.displayedOwner?.name ?? playingDreamRef.current?.user?.name ?? ''}</div>
        </div>
      `;
      setupOverlay(player.current, overlayContent);
    },
    web: () => {
      window.open(import.meta.env.VITE_FRONTEND_URL, "_blank");
    },
    help: () => { },
    status: () => { },
    set_speed_1: () => {
      setSpeed(1);
      player.current?.playbackRate(SPEEDS[1]);
    },
    set_speed_2: () => {
      setSpeed(2);
      player.current?.playbackRate(SPEEDS[2]);
    },
    set_speed_3: () => {
      setSpeed(3);
      player.current?.playbackRate(SPEEDS[3]);
    },
    set_speed_4: () => {
      setSpeed(4);
      player.current?.playbackRate(SPEEDS[4]);
    },
    set_speed_5: () => {
      setSpeed(5);
      player.current?.playbackRate(SPEEDS[5]);
    },
    set_speed_6: () => {
      setSpeed(6);
      player.current?.playbackRate(SPEEDS[6]);
    },
    set_speed_7: () => {
      setSpeed(7);
      player.current?.playbackRate(SPEEDS[7]);
    },
    set_speed_8: () => {
      setSpeed(8);
      player.current?.playbackRate(SPEEDS[8]);
    },
    set_speed_9: () => {
      setSpeed(9);
      player.current?.playbackRate(SPEEDS[9]);
    },
    capture: () => { },
    report: () => { },
    reset_playlist: () => { }
  }), [player, speed, brightness, currentPlaylist, emit, playVideo, setVideoJSBrightness]);

  // handles when a video ends playing
  const handleOnEnded = useCallback(() => {
    const { next } = getPlaylistNavigation(playingDreamRef.current, currentPlaylist);
    const dreamToPlay = next?.dreamItem ?? currentPlaylist?.items?.[0]?.dreamItem;
    if (dreamToPlay) {
      playVideo(dreamToPlay?.video);
      playingDreamRef.current = dreamToPlay;
      emit(NEW_REMOTE_CONTROL_EVENT, { event: "playing", uuid: dreamToPlay.uuid })
    }
  }, [emit, playVideo, currentPlaylist]);

  useStatusCallback(isActive, {
    onActive: () => {
      setIsWebClientAvailable(false);
    },
    onInactive: () => {
      toast.info("Desktop client is inactive, you're able to play something on the web client clicking play button.");
      setIsWebClientAvailable(true);
    },
  });

  // play current dream when playerjs is ready
  useEffect(() => {
    if (isReady && playingDreamRef.current) {
      playVideo(playingDreamRef.current.video);
    }
  }, [isReady, playVideo]);

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
