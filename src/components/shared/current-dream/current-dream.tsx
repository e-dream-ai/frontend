import { useDream } from "@/api/dream/query/useDream";
import { Column, ItemCardList, ItemCard, Text, Row, Button } from "@/components/shared";
import { Spinner } from "@/components/shared/spinner/spinner";
import {
  NEW_REMOTE_CONTROL_EVENT,
  REMOTE_CONTROLS,
} from "@/constants/remote-control.constants";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import { User } from "@/types/auth.types";
import {
  RemoteControlAction,
  RemoteControlEventData,
} from "@/types/remote-control.types";
import { getRemoteControlEvent } from "@/utils/remote-control.util";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ItemCardSkeleton } from "../item-card/item-card";
import { useTheme } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { useWebClient } from "@/hooks/useWebClient";

type CurrentDreamProps = {
  uuid?: string;
  user?: User;
};

export const CurrentDream = ({ uuid }: CurrentDreamProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [stateUUID, setStateUUID] = useState<string | undefined>(uuid);
  const { data, isLoading, isRefetching, refetch } = useDream(stateUUID);
  const { isWebClientAvailable, setWebClientActive, setWebPlayerAvailable } = useWebClient()
  const dream = data?.data?.dream;

  const handleRemoteControlEvent = (data?: RemoteControlEventData): void => {
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
  useSocketEventListener<RemoteControlEventData>(
    NEW_REMOTE_CONTROL_EVENT,
    handleRemoteControlEvent,
  );

  const handleActivateWebClient = () => {
    setWebClientActive(true);
    setWebPlayerAvailable(false);
  };

  useEffect(() => {
    if (stateUUID) refetch();
  }, [stateUUID, refetch]);

  useEffect(() => {
    setStateUUID(uuid);
  }, [uuid]);

  return (
    <Column mb="2rem">
      <Row justifyContent="space-between" mb="0">
        <Text mb="1rem" fontSize="1rem" fontWeight={600}>
          {t("components.current_dream.title")}
        </Text>

        {isWebClientAvailable && <Button
          type="button"
          buttonType="default"
          size="md"
          transparent
          onClick={handleActivateWebClient}
        >
          <FontAwesomeIcon icon={faPlay} />
        </Button>}
      </Row>
      {isLoading || isRefetching ? (
        <ItemCardSkeleton>
          <Spinner />
        </ItemCardSkeleton>
      ) : dream ? (
        <ItemCardList>
          <ItemCard type="dream" item={dream} size="sm" inline />
        </ItemCardList>
      ) : (
        <ItemCardSkeleton>
          <Text color={theme.textBodyColor}>
            {t("components.current_dream.no_current_dream")}
          </Text>
        </ItemCardSkeleton>
      )}
    </Column>
  );
};
