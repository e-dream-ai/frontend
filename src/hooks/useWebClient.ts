import WebClientContext from "@/context/web-client.context";
import { useContext } from "react";

// Create hook to use the shared state
export const useWebClient = () => {
  const context = useContext(WebClientContext);
  if (context === undefined) {
    throw new Error("useWebClient must be used within a DesktopClientProvider");
  }
  return context;
};
