import useSocket from "@/hooks/useSocket";
import { useDesktopClient } from "@/hooks/useDesktopClient";
import { useWebClient } from "@/hooks/useWebClient";

export const usePlaybackClient = (): boolean => {
  const { connectedDevicesCount, hasWebPlayer } = useSocket();
  const { isActive: isDesktopActive } = useDesktopClient();
  const { isWebClientActive } = useWebClient();

  return (
    isDesktopActive ||
    isWebClientActive ||
    ((connectedDevicesCount ?? 0) > 1 && Boolean(hasWebPlayer))
  );
};

export default usePlaybackClient;
