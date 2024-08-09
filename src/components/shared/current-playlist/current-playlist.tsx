import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import {
  Row,
  Column,
  ItemCardList,
  ItemCard,
  Button,
} from "@/components/shared";
import { Spinner } from "@/components/shared/spinner/spinner";
import {
  NEW_REMOTE_CONTROL_EVENT,
  REMOTE_CONTROLS,
} from "@/constants/remote-control.constants";
import useRemoteControlSocket from "@/hooks/useRemoteControlSocket";
import useSocket from "@/hooks/useSocket";
import { User } from "@/types/auth.types";
import {
  RemoteControlAction,
  RemoteControlEvent,
} from "@/types/remote-control.types";
import { getRemoteControlEvent } from "@/utils/remote-control.util";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type CurrentPlaylistProps = {
  uuid?: string;
  user?: User;
};

export const CurrentPlaylist = ({ uuid }: CurrentPlaylistProps) => {
  const { socket } = useSocket();
  const { t } = useTranslation();
  const [stateUUID, setStateUUID] = useState<string | undefined>(uuid);
  const { data, isLoading, isRefetching, refetch } = usePlaylist(stateUUID);
  const playlist = data?.data?.playlist;

  const onRemoveCurrentPlaylist = () => {
    socket?.emit(NEW_REMOTE_CONTROL_EVENT, {
      event: REMOTE_CONTROLS.RESET_PLAYLIST.event,
    });
    setStateUUID(undefined);
  };

  useEffect(() => {
    if (stateUUID) refetch();
  }, [stateUUID, refetch]);

  useEffect(() => {
    setStateUUID(uuid);
  }, [uuid]);

  const handleRemoteControlEvent = (data?: RemoteControlEvent): void => {
    const event: RemoteControlAction | undefined = getRemoteControlEvent(
      data?.event,
    );

    if (!event) {
      return;
    }

    if (event.event === REMOTE_CONTROLS.PLAY_PLAYLIST.event) {
      const newUUID = data?.uuid;
      setStateUUID(newUUID);
    }

    if (event.event === REMOTE_CONTROLS.RESET_PLAYLIST.event) {
      setStateUUID(undefined);
    }
  };

  /**
   * Handle new remote control events from the server for dream on profile
   */
  useRemoteControlSocket(handleRemoteControlEvent);

  if (!playlist) {
    return (
      <Column mb="2rem">
        {t("components.current_playlist.no_current_playlist")}
      </Column>
    );
  }

  return (
    <Column mb="2rem">
      {isLoading || isRefetching ? (
        <Row justifyContent="center">
          <Spinner />
        </Row>
      ) : (
        <>
          <Row justifyContent="flex-end">
            <Button
              type="button"
              buttonType="danger"
              transparent
              ml="1rem"
              onClick={onRemoveCurrentPlaylist}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </Row>
          <ItemCardList columns={2}>
            <ItemCard type="playlist" item={playlist} size="sm" />
          </ItemCardList>
        </>
      )}
    </Column>
  );
};
