import { useEffect, useRef, useState } from "react";
import Row, { Column } from "../row/row";

const OfflineHandler: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isMountedRef = useRef(true);

  const probeConnectivity = async (timeoutMs = 4000): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const url = `/robots.txt?__reachability__=${Date.now()}`;
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        credentials: "omit",
        headers: {
          "cache-control": "no-store",
          pragma: "no-cache",
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return !!response && response.type !== "error";
    } catch {
      return false;
    }
  };

  const refreshOnlineStatus = async () => {
    const reachable = await probeConnectivity();
    if (!isMountedRef.current) return;
    setIsOnline(reachable || navigator.onLine);
  };

  useEffect(() => {
    isMountedRef.current = true;

    const handleOnline = () => {
      refreshOnlineStatus();
    };
    const handleOffline = () => {
      refreshOnlineStatus();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshOnlineStatus();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);

    refreshOnlineStatus();

    const intervalId = window.setInterval(refreshOnlineStatus, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.clearInterval(intervalId);
      isMountedRef.current = false;
    };
  }, []);

  if (!isOnline) {
    return (
      <Row>
        <Column justifyItems="center" alignItems="center" flex="auto" mt="3rem">
          <img
            style={{ width: "6rem", height: "auto" }}
            src="/images/edream-logo-512x512.png"
            alt="e-dream logo"
          />
          <h1>You're offline</h1>
          <p>Please check your internet connection and try again.</p>
        </Column>
      </Row>
    );
  }

  return children;
};

export default OfflineHandler;
