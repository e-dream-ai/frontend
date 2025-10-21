import { REMOTE_CONTROLS } from "@/constants/remote-control.constants";

export type RemoteControlEvent =
  | "playing"
  | "play_dream"
  | "play_playlist"
  | "like"
  | "dislike"
  | "like_current_dream"
  | "dislike_current_dream"
  | "previous"
  | "next"
  | "forward"
  | "backward"
  | "pause"
  | "playback_slower"
  | "playback_faster"
  | "brighter"
  | "darker"
  | "web"
  | "help"
  | "status"
  | "credit"
  | "capture"
  | "report"
  | "reset_playlist"
  | `set_speed_${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | "fullscreen";

export type RemoteControlAction = {
  event: RemoteControlEvent;
  key: string;
  triggerKey: string;
  [key: string]: unknown;
};

export type RemoteControlEventData = {
  event: string;
  name?: string;
  uuid?: string;
  id?: number;
  key?: string;
  isWebClientEvent?: boolean;
};

export type RemoteEvent =
  (typeof REMOTE_CONTROLS)[keyof typeof REMOTE_CONTROLS]["event"];
