import {
  NEW_REMOTE_CONTROL_EVENT,
  PING_EVENT,
  GOOD_BYE_EVENT,
  PING_REDIS_EVENT,
} from "@/constants/remote-control.constants";
import { RemoteControlEvent } from "./remote-control.types";
import { PresenceHeartbeatPayload, PresenceJoinPayload } from "./roles.types";
import {
  PRESENCE_HEARTBEAT_EVENT,
  PRESENCE_JOIN_EVENT,
} from "@/constants/roles.constants";

export type EmitEvents = {
  [NEW_REMOTE_CONTROL_EVENT]: (data: {
    event: RemoteControlEvent;
    [key: string]: unknown;
  }) => void;
  [PING_EVENT]: () => void;
  [GOOD_BYE_EVENT]: () => void;
  [PING_REDIS_EVENT]: () => void;
  [PRESENCE_JOIN_EVENT]: (data: PresenceJoinPayload) => void;
  [PRESENCE_HEARTBEAT_EVENT]: (data: PresenceHeartbeatPayload) => void;
};

export type EmitListener = {
  [Ev in keyof EmitEvents]: (
    event: Ev,
    ...args: Parameters<EmitEvents[Ev]>
  ) => void;
}[keyof EmitEvents];
