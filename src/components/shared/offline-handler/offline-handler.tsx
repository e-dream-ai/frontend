import { useEffect, useState } from "react";
import Row, { Column } from "../row/row";

const OfflineHandler: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
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
