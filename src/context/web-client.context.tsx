import { NEW_REMOTE_CONTROL_EVENT } from "@/constants/remote-control.constants";
import useAuth from "@/hooks/useAuth";
import { useDesktopClient } from "@/hooks/useDesktopClient";
import { useSocketEmitListener } from "@/hooks/useSocketEmitListener";
import useStatusCallback from "@/hooks/useStatusCallback";
import { Dream } from "@/types/dream.types";
import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";

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

export const WebClientProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth()
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

  const setWebClientActive = useCallback((isActive: boolean) => {
    if (isActive) {
      setPlayingDream(user?.currentDream)
    }
    setIsWebClientActive(isActive)
  }, [user]);

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
      toast.info("remote control event listened " + data.event);
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
