import { Socket } from "socket.io-client";
import { toast } from "react-toastify";
import type { TFunction } from "i18next";
import {
  NEW_REMOTE_CONTROL_EVENT,
  REMOTE_CONTROLS,
  REMOTE_CONTROLS_TRANSLATIONS,
} from "@/constants/remote-control.constants";
import { Dream } from "@/types/dream.types";
import { Playlist } from "@/types/playlist.types";
import {
  RemoteControlAction,
  RemoteControlEventData,
} from "@/types/remote-control.types";
import { getRemoteControlEvent } from "@/utils/remote-control.util";

export const emitPlayDream = (
  socket?: Socket | null,
  dream?: Dream,
  message?: string,
) => {
  socket?.emit(NEW_REMOTE_CONTROL_EVENT, {
    event: REMOTE_CONTROLS.PLAY_DREAM.event,
    uuid: dream?.uuid,
    name: dream?.name,
  });
  if (message) toast.success(message);
};

export const emitPlayPlaylist = (
  socket?: Socket | null,
  playlist?: Playlist,
  message?: string,
) => {
  socket?.emit(NEW_REMOTE_CONTROL_EVENT, {
    event: REMOTE_CONTROLS.PLAY_PLAYLIST.event,
    uuid: playlist?.uuid,
    name: playlist?.name,
  });
  if (message) toast.success(message);
};

export const onNewRemoteControlEvent =
  (t: TFunction) =>
  async (data?: RemoteControlEventData): Promise<void | undefined> => {
    const event: RemoteControlAction | undefined = getRemoteControlEvent(
      data?.event,
    );

    if (!event) {
      return;
    }

    /**
     * PLAY_DREAM event doesn't need to be notificated on frontend
     * */
    if (event.event === REMOTE_CONTROLS.PLAY_DREAM.event) {
      return;
    }

    if (
      event.event === REMOTE_CONTROLS.LIKE_DREAM.event ||
      event.event === REMOTE_CONTROLS.LIKE_CURRENT_DREAM.event ||
      event.event === REMOTE_CONTROLS.DISLIKE_DREAM.event ||
      event.event === REMOTE_CONTROLS.DISLIKE_CURRENT_DREAM.event
    ) {
      toast.info(
        t(REMOTE_CONTROLS_TRANSLATIONS[event?.event], {
          name: data?.name ?? data?.uuid,
        }),
      );
      return;
    }
  };
