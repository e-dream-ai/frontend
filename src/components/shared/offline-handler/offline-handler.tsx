import { useCallback, useEffect, useRef, useState } from "react";
import Row, { Column } from "../row/row";
import { URL } from "@/constants/api.constants";

const activeInterval = 30000,
  inactiveInterval = 300000,
  inactivityThreshold = 60000;

const OfflineHandler: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const pingURL = `${URL}/v1/ping`;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const lastActivityTime = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  const checkOnlineStatus = useCallback(() => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }

    fetch(pingURL, {
      method: "HEAD",
      // Respect server's cache headers
      cache: "default",
    })
      .then(() => setIsOnline(true))
      .catch(() => setIsOnline(false));
  }, [pingURL]);

  const scheduleNextCheck = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityTime.current;
    const interval =
      timeSinceLastActivity > inactivityThreshold
        ? inactiveInterval
        : activeInterval;

    timeoutRef.current = setTimeout(checkOnlineStatus, interval);
  }, [checkOnlineStatus]);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    checkOnlineStatus(); // Double-check with a ping
  }, [checkOnlineStatus]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    checkOnlineStatus();
    scheduleNextCheck();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkOnlineStatus, scheduleNextCheck, handleOnline, handleOffline]);

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
