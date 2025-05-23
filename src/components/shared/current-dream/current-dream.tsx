import { useEffect } from "react";
import { Column, ItemCardList, ItemCard, Text, Row, Button } from "@/components/shared";
import { Spinner } from "@/components/shared/spinner/spinner";
import {
  NEW_REMOTE_CONTROL_EVENT,
  REMOTE_CONTROLS,
} from "@/constants/remote-control.constants";
import useSocketEventListener from "@/hooks/useSocketEventListener";
import {
  RemoteControlAction,
  RemoteControlEventData,
} from "@/types/remote-control.types";
import { getRemoteControlEvent } from "@/utils/remote-control.util";
import { useTranslation } from "react-i18next";
import { ItemCardSkeleton } from "../item-card/item-card";
import { useTheme } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { useWebClient } from "@/hooks/useWebClient";
import useAuth from "@/hooks/useAuth";

export const CurrentDream = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currentDream, isLoadingCurrentDream, refreshCurrentDream } = useAuth();
  const { isWebClientAvailable, setWebClientActive, setWebPlayerAvailable } = useWebClient()

  const handleRemoteControlEvent = async (data?: RemoteControlEventData): Promise<void | undefined> => {
    const event: RemoteControlAction | undefined = getRemoteControlEvent(
      data?.event,
    );

    if (!event) {
      return;
    }

    if (event.event === REMOTE_CONTROLS.PLAYING.event) {
      refreshCurrentDream();
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

  // update current dream on component mount
  useEffect(() => {
    refreshCurrentDream();
  }, [refreshCurrentDream])

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
      {isLoadingCurrentDream ? (
        <ItemCardSkeleton>
          <Spinner />
        </ItemCardSkeleton>
      ) : currentDream ? (
        <ItemCardList>
          <ItemCard type="dream" item={currentDream} size="sm" inline />
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
