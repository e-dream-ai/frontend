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
  // sources: VideoSource[];
  width?: number;
  height?: number;
  playbackRates?: number[];
  preload?: string;
};
