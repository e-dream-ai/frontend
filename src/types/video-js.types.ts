// types for video sources
export type VideoSource = {
  src: string;
  type: string;
};

// types for videojs options
export type VideoJSOptions = {
  autoplay?: boolean;
  controls?: boolean;
  responsive?: boolean;
  fluid?: boolean;
  width?: number;
  height?: number;
  playbackRates?: number[];
  preload?: string;
};

export type VideoJSEvents = {
  READY: "ready";
  LOADSTART: "loadstart";
  LOADEDDATA: "loadeddata";
  LOADEDMETADATA: "loadedmetadata";
  CANPLAY: "canplay";
  CANPLAYTHROUGH: "canplaythrough";
  PLAY: "play";
  PLAYING: "playing";
  WAITING: "waiting";
  ERROR: "error";
  ENDED: "ended";
  TIMEUPDATE: "timeupdate";
};
