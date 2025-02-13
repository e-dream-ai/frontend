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

// transition previous time on seconds
export const CROSSFADE_DURATION = 1;
