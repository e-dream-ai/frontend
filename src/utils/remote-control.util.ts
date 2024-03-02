import { REMOTE_CONTROLS } from "@/constants/remote-control.constants";
import { RemoteControlAction } from "@/types/remote-control.types";

export const getRemoteControlEvent = (
  event: string,
): RemoteControlAction | undefined => {
  const foundIndex = Object.keys(REMOTE_CONTROLS).findIndex((key) => {
    const remoteControl = REMOTE_CONTROLS[key] as RemoteControlAction;
    return remoteControl?.event === event;
  });

  if (foundIndex < 0) {
    return;
  }

  return REMOTE_CONTROLS[Object.keys(REMOTE_CONTROLS)[foundIndex]];
};

export const getRemoteControlKey = (event: string): string | undefined =>
  Object.keys(REMOTE_CONTROLS).find((key) => {
    const remoteControl = REMOTE_CONTROLS[key];
    if (remoteControl?.event === event) {
      return remoteControl?.key;
    }
  });
