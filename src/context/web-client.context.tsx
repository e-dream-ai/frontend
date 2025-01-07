import { NEW_REMOTE_CONTROL_EVENT } from "@/constants/remote-control.constants";
import useAuth from "@/hooks/useAuth";
import { useDesktopClient } from "@/hooks/useDesktopClient";
import { useSocketEmitListener } from "@/hooks/useSocketEmitListener";
import useStatusCallback from "@/hooks/useStatusCallback";
import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import { useVideoJs } from "@/hooks/useVideoJS";
import { Dream } from "@/types/dream.types";
import { RemoteEvent } from "@/types/remote-control.types";
import { getPlaylistNavigation } from "@/utils/web-client.util";
import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";

const SPEEDS = {
  0: 0,     // pause
  1: 0.25,
  2: 0.5,
  3: 0.75,
  4: 1,     // normal
  5: 1.25,
  6: 1.5,
  7: 1.75,
  8: 1.85,
  9: 2      // fastest
} as const;

type SpeedKey = keyof typeof SPEEDS;

const BRIGHTNESS = {
  0: 0,      // darkest
  1: 0.25,
  2: 0.5,
  3: 0.75,
  4: 1,      // normal
  5: 1.25,
  6: 1.5,
  7: 1.75,
  8: 1.85,
  9: 2       // brightest
} as const;

type BrightnessKey = keyof typeof BRIGHTNESS;

type WebClientContextType = {
  isWebClientActive: boolean;
  isWebPlayerAvailable: boolean;
  playingDream?: Dream;
  setWebClientActive: (isActive: boolean) => void;
  setWebPlayerAvailable: (isActive: boolean) => void;
};

export const WebClientContext = createContext<WebClientContextType>(
  {} as WebClientContextType,
);

// helper function to find current speed key
const findCurrentSpeedKey = (currentSpeed: number, speeds: typeof SPEEDS) => {
  return Object.entries(speeds).find(([_, value]) => value === currentSpeed)?.[0] || '4';
};

// helper function to find current brightness key
const findCurrentBrightnessKey = (currentBrightness: number, brightnesses: typeof BRIGHTNESS) => {
  return Object.entries(brightnesses).find(([_, value]) => value === currentBrightness)?.[0] || '4';
};

export const WebClientProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  // user
  const { user } = useAuth()

  // videojs
  const { player, setBrightness: setVideoJSBrightness, playVideo } = useVideoJs()

  // user current values
  const currentDream = user?.currentDream;

  const { data } = usePlaylist(user?.currentPlaylist?.uuid);
  const currentPlaylist = data?.data?.playlist;


  /** 
   * indicates if the web player is currently active
   */
  const [isWebClientActive, setIsWebClientActive] = useState<boolean>(false);
  /** 
   * indicates if the web player play button can be shown to the user
   */
  const [isWebPlayerAvailable, setIsWebPlayerAvailable] = useState<boolean>(false);
  const { isActive } = useDesktopClient();
  const [playingDream, setPlayingDream] = useState<Dream>();

  // player states
  const [, setPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(SPEEDS[4]);
  const [brightness, setBrightness] = useState<number>(BRIGHTNESS[4]);

  const setWebClientActive = useCallback((isActive: boolean) => {
    if (isActive) {
      setPlayingDream(currentDream)
    }
    setIsWebClientActive(isActive)
  }, [currentDream]);

  const setWebPlayerAvailable = useCallback((isActive: boolean) => {
    setIsWebPlayerAvailable(isActive)
  }, []);

  useStatusCallback(isActive, {
    onActive: () => {
      setIsWebPlayerAvailable(false);
    },
    onInactive: () => {
      toast.info("Desktop client is inactive, you're able to play something on the web client clicking play button.");
      setIsWebPlayerAvailable(true);
    },
  });

  useSocketEmitListener((event, data) => {
    if (event === NEW_REMOTE_CONTROL_EVENT) {

      const handlers: Record<RemoteEvent, () => boolean> = {
        playback_slower: () => {
          const currentKey = parseInt(findCurrentSpeedKey(speed, SPEEDS));
          if (currentKey > 0) {
            const newKey = currentKey - 1 as SpeedKey;
            setSpeed(SPEEDS[newKey]);
            player.current?.playbackRate(SPEEDS[newKey]);
          }
          return true;
        },
        playback_faster: () => {
          const currentKey = parseInt(findCurrentSpeedKey(speed, SPEEDS));
          if (currentKey < 9) {
            const newKey = currentKey + 1 as SpeedKey;
            setSpeed(SPEEDS[newKey]);
            player.current?.playbackRate(SPEEDS[newKey]);
          }
          return true;
        },
        brighter: () => {
          const currentKey = parseInt(findCurrentBrightnessKey(brightness, BRIGHTNESS));
          if (currentKey < 9) {
            const newKey = currentKey + 1 as BrightnessKey;
            setBrightness(BRIGHTNESS[newKey]);
            setVideoJSBrightness(BRIGHTNESS[newKey]);
          }
          return true;
        },
        darker: () => {
          const currentKey = parseInt(findCurrentBrightnessKey(brightness, BRIGHTNESS));
          if (currentKey > 0) {
            const newKey = currentKey - 1 as BrightnessKey;
            setBrightness(BRIGHTNESS[newKey]);
            setVideoJSBrightness(BRIGHTNESS[newKey]);
          }
          return true;
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
          return true;
        },
        playing: () => true,
        play_dream: () => true,
        play_playlist: () => true,
        like: () => true,
        dislike: () => true,
        like_current_dream: () => true,
        dislike_current_dream: () => true,
        previous: () => {
          const { previous } = getPlaylistNavigation(currentDream, currentPlaylist);
          const dreamToPlay = previous?.dreamItem ?? currentPlaylist?.items?.[0]?.dreamItem;
          // setPlayingDream(previous?.dreamItem);
          if (dreamToPlay) {
            playVideo(dreamToPlay?.video);
          }
          return true;
        },
        next: () => {
          const { next } = getPlaylistNavigation(currentDream, currentPlaylist);
          const dreamToPlay = next?.dreamItem ?? currentPlaylist?.items?.[0]?.dreamItem;
          // setPlayingDream(nextDreamToPlay);
          if (dreamToPlay) {
            playVideo(dreamToPlay?.video);
          }
          return true;
        },
        forward: () => {
          if (player.current) {
            const currentTime = player.current.currentTime() ?? 0;
            // 10 seconds
            player.current.currentTime(currentTime + 10);
          }
          return true
        },
        backward: () => {
          if (player.current) {
            const currentTime = player.current.currentTime() ?? 0;
            // 10 seconds
            player.current.currentTime(Math.max(0, currentTime - 10));
          }
          return true
        },
        credit: () => true,
        web: () => {
          window.open(import.meta.env.VITE_FRONTEND_URL, "_blank");
          return true
        },
        help: () => true,
        status: () => true,
        set_speed_1: () => {
          setSpeed(1);
          player.current?.playbackRate(SPEEDS[1]);
          return true
        },
        set_speed_2: () => {
          setSpeed(2);
          player.current?.playbackRate(SPEEDS[2]);
          return true
        },
        set_speed_3: () => {
          setSpeed(3);
          player.current?.playbackRate(SPEEDS[3]);
          return true
        },
        set_speed_4: () => {
          setSpeed(4);
          player.current?.playbackRate(SPEEDS[4]);
          return true
        },
        set_speed_5: () => {
          setSpeed(5);
          player.current?.playbackRate(SPEEDS[5]);
          return true
        },
        set_speed_6: () => {
          setSpeed(6);
          player.current?.playbackRate(SPEEDS[6]);
          return true
        },
        set_speed_7: () => {
          setSpeed(7);
          player.current?.playbackRate(SPEEDS[7]);
          return true
        },
        set_speed_8: () => {
          setSpeed(8);
          player.current?.playbackRate(SPEEDS[8]);
          return true
        },
        set_speed_9: () => {
          setSpeed(9);
          player.current?.playbackRate(SPEEDS[9]);
          return true
        },
        capture: () => true,
        report: () => true,
        reset_playlist: () => true
      };

      toast.info("remote control event listened " + data.event);
      return handlers[data.event]();

    }
  });

  const memoedValue = useMemo(
    () => ({
      isWebClientActive,
      isWebPlayerAvailable,
      playingDream,
      setWebClientActive,
      setWebPlayerAvailable
    }),
    [
      isWebClientActive,
      isWebPlayerAvailable,
      playingDream,
      setWebClientActive,
      setWebPlayerAvailable
    ],
  );

  return (
    <WebClientContext.Provider value={memoedValue}>{children}</WebClientContext.Provider>
  );
};

export default WebClientContext;
