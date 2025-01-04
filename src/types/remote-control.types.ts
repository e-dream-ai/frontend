import { REMOTE_CONTROLS } from "@/constants/remote-control.constants";

export type RemoteControlAction = {
  event: string;
  key: string;
  [key: string]: unknown;
};

export type RemoteControlEvent = {
  event: string;
  name?: string;
  uuid?: string;
  id?: number;
  key?: string;
};

export type RemoteEvent =
  (typeof REMOTE_CONTROLS)[keyof typeof REMOTE_CONTROLS]["event"];
