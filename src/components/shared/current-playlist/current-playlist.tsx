import { usePlaylist } from "@/api/playlist/query/usePlaylist";
import { Row, Column, ItemCardList, ItemCard } from "@/components/shared";
import { Spinner } from "@/components/shared/spinner/spinner";
import {
  NEW_REMOTE_CONTROL_EVENT,
  REMOTE_CONTROLS,
} from "@/constants/remote-control.constants";
import useSocket from "@/hooks/useSocket";
import {
  RemoteControlAction,
  RemoteControlEvent,
} from "@/types/remote-control.types";
import { getRemoteControlEvent } from "@/utils/remote-control.util";
import { useEffect, useState } from "react";

type CurrentPlaylistProps = {
  id?: number;
};

export const CurrentPlaylist = ({ id }: CurrentPlaylistProps) => {
  const { socket } = useSocket();
  const [stateId, setStateId] = useState<number | undefined>(id);
  const { data, isLoading, isRefetching, refetch } = usePlaylist(stateId);
  const playlist = data?.data?.playlist;

  console.log({ playlist, id, stateId });

  useEffect(() => {
    refetch();
  }, [stateId, refetch]);

  useEffect(() => {
    setStateId(id);
  }, [id]);

  /**
   * Listen new remote control events from the server for dream on profile
   */
  useEffect(() => {
    socket?.on(NEW_REMOTE_CONTROL_EVENT, (data?: RemoteControlEvent): void => {
      const event: RemoteControlAction | undefined = getRemoteControlEvent(
        data?.event,
      );

      if (!event) {
        return;
      }

      if (event.event === REMOTE_CONTROLS.PLAY_PLAYLIST.event) {
        const newId = data?.id;
        setStateId(newId);
      }
    });

    // Cleanup on component unmount
    return () => {
      socket?.off(NEW_REMOTE_CONTROL_EVENT);
    };
  }, [socket]);

  return (
    <Column mb="2rem">
      {isLoading || isRefetching ? (
        <Row justifyContent="center">
          <Spinner />
        </Row>
      ) : (
        <ItemCardList>
          <ItemCard type="playlist" item={playlist} />
        </ItemCardList>
      )}
    </Column>
  );
};
