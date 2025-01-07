import VideoJSContext from "@/context/video-js.context";
import { useContext } from "react";

// Create hook to use videojs
export const useVideoJs = () => {
  const context = useContext(VideoJSContext);
  if (context === undefined) {
    throw new Error("useVideoJs must be used within a VideoJsProvider");
  }
  return context;
};
