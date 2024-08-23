import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import {
  Row,
  Column,
  ItemCardList,
  ItemCard,
  Button,
  Text,
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

  return (
    <Column mb="2rem">
      <Row justifyContent="space-between" mb="0">
        <Text mb="1rem" fontSize="1rem" fontWeight={600}>
          {t("components.current_playlist.title")}
        </Text>
        {playlist ? (
          <Button
            type="button"
            buttonType="danger"
            size="md"
            transparent
            onClick={onRemoveCurrentPlaylist}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        ) : (
          <></>
        )}
      </Row>
      {isLoading || isRefetching ? (
        <Row justifyContent="center">
          <Spinner />
        </Row>
      ) : playlist ? (
        <ItemCardList>
          <ItemCard type="playlist" item={playlist} size="sm" inline />
        </ItemCardList>
      ) : (
        <Column mb="2rem">
          {t("components.current_playlist.no_current_playlist")}
        </Column>
      )}
    </Column>
  );
};
