import { useEffect, useState } from "react";
import Row, { Column } from "../row/row";

const checkRealConnectivity = async (timeout = 5000): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    await fetch("https://www.google.com/favicon.ico", {
      mode: "no-cors",
      signal: controller.signal,
      cache: "no-cache",
    });
    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
};

const OfflineHandler: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReallyOnline, setIsReallyOnline] = useState(true);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const reallyOnline = await checkRealConnectivity();
      setIsReallyOnline(reallyOnline);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReallyOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Periodic check to verify real connectivity
  useEffect(() => {
    if (!isOnline) return;

    const checkConnectivity = async () => {
      const reallyOnline = await checkRealConnectivity();
      setIsReallyOnline(reallyOnline);
    };

    // Initial check
    checkConnectivity();

    // Check every 30 seconds
    const interval = setInterval(checkConnectivity, 30000);

    return () => clearInterval(interval);
  }, [isOnline]);

  if (!isOnline || !isReallyOnline) {
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
