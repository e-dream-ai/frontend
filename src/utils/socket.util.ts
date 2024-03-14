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

export const emitPlayDream = (socket?: Socket, dream?: Dream) => {
  socket?.emit(NEW_REMOTE_CONTROL_EVENT, {
    event: REMOTE_CONTROLS.PLAY_DREAM.event,
    uuid: dream?.uuid,
    name: dream?.name,
  });
};

export const emitPlayPlaylist = (socket?: Socket, playlist?: Playlist) => {
  socket?.emit(NEW_REMOTE_CONTROL_EVENT, {
    event: REMOTE_CONTROLS.PLAY_PLAYLIST.event,
    id: playlist?.id,
    name: playlist?.name,
  });
};

export const onNewRemoteControlEvent =
  (t: TFunction) =>
  (data: RemoteControlEvent): void => {
    const event: RemoteControlAction | undefined = getRemoteControlEvent(
      data?.event,
    );

    if (!event) {
      return;
    }

    const key = event?.key;

    if (
      event.event === REMOTE_CONTROLS.PLAYING.event ||
      event.event === REMOTE_CONTROLS.PLAY_DREAM.event ||
      event.event === REMOTE_CONTROLS.PLAY_PLAYLIST.event
    ) {
      toast(`${t(REMOTE_CONTROLS_TRANSLATIONS[event?.event])}: ${data?.name}`);
      return;
    }

    toast(
      `${t("components.remote_control.event")}: ${key ? `${key}` : ""} ${t(
        REMOTE_CONTROLS_TRANSLATIONS[event?.event],
      )}`,
    );
  };
