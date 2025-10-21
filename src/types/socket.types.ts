import {
  NEW_REMOTE_CONTROL_EVENT,
  PING_EVENT,
  GOOD_BYE_EVENT,
  PING_REDIS_EVENT,
} from "@/constants/remote-control.constants";
import { RemoteControlEvent } from "./remote-control.types";

export type EmitEvents = {
  [NEW_REMOTE_CONTROL_EVENT]: (data: {
    event: RemoteControlEvent;
    [key: string]: unknown;
  }) => void;
  [PING_EVENT]: () => void;
  [GOOD_BYE_EVENT]: () => void;
  [PING_REDIS_EVENT]: () => void;
  "device:register": (data: Record<string, unknown>) => void;
  "device:ping": () => void;
};

export type EmitListener = {
  [Ev in keyof EmitEvents]: (
    event: Ev,
    ...args: Parameters<EmitEvents[Ev]>
  ) => void;
}[keyof EmitEvents];
