import DesktopClientContext from "@/context/desktop-client.context";
import { useContext } from "react";

// Create hook to use the shared state
export const useDesktopClient = () => {
  const context = useContext(DesktopClientContext);
  if (context === undefined) {
    throw new Error(
      "useDesktopClient must be used within a DesktopClientProvider",
    );
  }
  return context;
};
