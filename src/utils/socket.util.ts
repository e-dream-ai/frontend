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
  RemoteControlEvent,
} from "@/types/remote-control.types";
import { getRemoteControlEvent } from "@/utils/remote-control.util";

export const emitPlayDream = (
  socket?: Socket,
  dream?: Dream,
  message?: string,
) => {
  socket?.emit(NEW_REMOTE_CONTROL_EVENT, {
    event: REMOTE_CONTROLS.PLAY_DREAM.event,
    uuid: dream?.uuid,
    name: dream?.name,
  });
  if (message) toast.info(message);
};

export const emitPlayPlaylist = (
  socket?: Socket,
  playlist?: Playlist,
  message?: string,
) => {
  socket?.emit(NEW_REMOTE_CONTROL_EVENT, {
    event: REMOTE_CONTROLS.PLAY_PLAYLIST.event,
    id: playlist?.id,
    name: playlist?.name,
  });
  if (message) toast.info(message);
};

export const onNewRemoteControlEvent =
  (t: TFunction) =>
  (data?: RemoteControlEvent): void => {
    const event: RemoteControlAction | undefined = getRemoteControlEvent(
      data?.event,
    );

    if (!event) {
      return;
    }

    const key = event?.key;

    /**
     * PLAY_DREAM event doesn't need to be notificated on frontend
     * */
    if (event.event === REMOTE_CONTROLS.PLAY_DREAM.event) {
      return;
    }

    if (
      event.event === REMOTE_CONTROLS.PLAYING.event ||
      event.event === REMOTE_CONTROLS.PLAY_PLAYLIST.event
    ) {
      toast(
        `${t(REMOTE_CONTROLS_TRANSLATIONS[event?.event])}: ${
          data?.name ?? data?.uuid ?? "-"
        }`,
      );
      return;
    }

    toast(
      `${t("components.remote_control.event")}: ${key ? `${key}` : ""} ${t(
        REMOTE_CONTROLS_TRANSLATIONS[event?.event],
      )}`,
    );
  };
