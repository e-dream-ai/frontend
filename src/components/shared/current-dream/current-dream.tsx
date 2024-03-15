import { useDream } from "@/api/dream/query/useDream";
import { Row, Column, ItemCardList, ItemCard } from "@/components/shared";
import { Spinner } from "@/components/shared/spinner/spinner";
import { REMOTE_CONTROLS } from "@/constants/remote-control.constants";
import useSocket from "@/hooks/useSocket";
import { User } from "@/types/auth.types";
import {
  RemoteControlAction,
  RemoteControlEvent,
} from "@/types/remote-control.types";
import { getRemoteControlEvent } from "@/utils/remote-control.util";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type CurrentDreamProps = {
  uuid?: string;
  user?: User;
};

export const CurrentDream = ({ uuid, user }: CurrentDreamProps) => {
  const { socket } = useSocket();
  const { t } = useTranslation();
  const [stateUUID, setStateUUID] = useState<string | undefined>(uuid);
  const { data, isLoading, isRefetching, refetch } = useDream(stateUUID);
  const dream = data?.data?.dream;

  useEffect(() => {
    if (stateUUID) refetch();
  }, [stateUUID, refetch]);

  useEffect(() => {
    setStateUUID(uuid);
  }, [uuid]);

  /**
   * Listen new remote control events from the server for dream on profile
   */
  useEffect(() => {
    const channel = user?.cognitoId ?? "user";
    socket?.on(user?.cognitoId ?? "user", (data?: RemoteControlEvent): void => {
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
      socket?.off(channel);
    };
  }, [socket, user]);

  if (!dream) {
    return (
      <Column mb="2rem">
        {t("components.current_dream.no_current_dream")}
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
        <ItemCardList>
          <ItemCard type="dream" item={dream} />
        </ItemCardList>
      )}
    </Column>
  );
};
