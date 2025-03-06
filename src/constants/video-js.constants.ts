import { VideoJSEvents } from "@/types/video-js.types";

// VideoJS preload option
// auto | metadata | none
export const PRELOAD_OPTION = "metadata";

// using options documented by https://videojs.com/guides/options/#controls
export const VIDEOJS_OPTIONS = {
  controls: true,
  fluid: true,
  preload: PRELOAD_OPTION,
  controlBar: true,
  disablePictureInPicture: true,
  // time on ms to consider an user inactive
  inactivityTimeout: 200,
  // disable videojs native hotkeys
  hotkeys: false,
  // render controlbar only
  children: ["controlBar"],
};

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
  minPlayers: 6,
  maxPlayers: 10,
};

// transition time on seconds
export const SHORT_CROSSFADE_DURATION = 1;
export const LONG_CROSSFADE_DURATION = 5;
export const NO_CROSSFADE_DURATION = 0;
