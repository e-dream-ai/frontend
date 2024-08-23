import { useDream } from "@/api/dream/query/useDream";
import { Row, Column, ItemCardList, ItemCard, Text } from "@/components/shared";
import { Spinner } from "@/components/shared/spinner/spinner";
import {
  NEW_REMOTE_CONTROL_EVENT,
  REMOTE_CONTROLS,
} from "@/constants/remote-control.constants";
import useSocketEventListener from "@/hooks/useSocketEventListener";
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

export const CurrentDream = ({ uuid }: CurrentDreamProps) => {
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

  const handleRemoteControlEvent = (data?: RemoteControlEvent): void => {
    const event: RemoteControlAction | undefined = getRemoteControlEvent(
      data?.event,
    );

    if (!event) {
      return;
    }

    if (event.event === REMOTE_CONTROLS.PLAYING.event) {
      const newUUID = data?.uuid;
      setStateUUID(newUUID);
    }
  };

  /**
   * Handle new remote control events from the server for dream on profile
   */
  useSocketEventListener<RemoteControlEvent>(
    NEW_REMOTE_CONTROL_EVENT,
    handleRemoteControlEvent,
  );

  return (
    <Column mb="2rem">
      <Text mb="1rem" fontSize="1rem" fontWeight={600}>
        {t("components.current_dream.title")}
      </Text>
      {isLoading || isRefetching ? (
        <Row justifyContent="center">
          <Spinner />
        </Row>
      ) : dream ? (
        <ItemCardList>
          <ItemCard type="dream" item={dream} size="sm" inline />
        </ItemCardList>
      ) : (
        <Text>{t("components.current_dream.no_current_dream")}</Text>
      )}
    </Column>
  );
};
