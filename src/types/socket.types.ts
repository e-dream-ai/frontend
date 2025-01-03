import {
  NEW_REMOTE_CONTROL_EVENT,
  PING_EVENT,
  GOOD_BYE_EVENT,
} from "@/constants/remote-control.constants";

export type EmitEvents = {
  [NEW_REMOTE_CONTROL_EVENT]: (data: { event: string }) => void;
  [PING_EVENT]: () => void;
  [GOOD_BYE_EVENT]: () => void;
};

export type EmitListener = {
  [Ev in keyof EmitEvents]: (
    event: Ev,
    ...args: Parameters<EmitEvents[Ev]>
  ) => void;
}[keyof EmitEvents];
