import { VideoJSEvents } from "@/types/video-js.types";

export const VIDEOJS_EVENTS: { [K in keyof VideoJSEvents]: VideoJSEvents[K] } =
  {
    READY: "ready",
    LOADSTART: "loadstart",
    LOADEDDATA: "loadeddata",
    LOADEDMETADATA: "loadedmetadata",
    CANPLAY: "canplay",
    CANPLAYTHROUGH: "canplaythrough",
    PLAYING: "playing",
    WAITING: "waiting",
    ERROR: "error",
    ENDED: "ended",
    TIMEUPDATE: "timeupdate",
  };

// players pool configuration
export const PoolConfig = {
  minPlayers: 4,
  maxPlayers: 6,
};

// transition time on seconds
export const SHORT_CROSSFADE_DURATION = 1;
export const LONG_CROSSFADE_DURATION = 5;
export const NO_CROSSFADE_DURATION = 0;
