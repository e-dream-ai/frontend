import { useDream } from "@/api/dream/query/useDream";
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

type CurrentDreamProps = {
  uuid?: string;
};

export const CurrentDream = ({ uuid }: CurrentDreamProps) => {
  const { socket } = useSocket();
  const [stateUUID, setStateUUID] = useState<string | undefined>(uuid);
  const { data, isLoading, isRefetching, refetch } = useDream(stateUUID);
  const dream = data?.data?.dream;

  useEffect(() => {
    refetch();
  }, [stateUUID, refetch]);

  useEffect(() => {
    setStateUUID(uuid);
  }, [uuid]);

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

      if (
        event.event === REMOTE_CONTROLS.PLAYING.event ||
        event.event === REMOTE_CONTROLS.PLAY_DREAM.event
      ) {
        const newUUID = data?.uuid;
        setStateUUID(newUUID);
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
          <ItemCard type="dream" item={dream} />
        </ItemCardList>
      )}
    </Column>
  );
};
