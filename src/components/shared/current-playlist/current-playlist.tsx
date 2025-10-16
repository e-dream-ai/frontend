import { useEffect } from "react";
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
import useSocket from "@/hooks/useSocket";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { ItemCardSkeleton } from "../item-card/item-card";
import { useTheme } from "styled-components";
import useAuth from "@/hooks/useAuth";

export const CurrentPlaylist = () => {
  const { t } = useTranslation();
  const { emit } = useSocket();
  const theme = useTheme();
  const { currentPlaylist, isLoadingCurrentPlaylist, refreshCurrentPlaylist } =
    useAuth();

  const onRemoveCurrentPlaylist = () => {
    emit(NEW_REMOTE_CONTROL_EVENT, {
      event: REMOTE_CONTROLS.RESET_PLAYLIST.event,
    });

    refreshCurrentPlaylist();
  };

  // update current playlist on component mount
  useEffect(() => {
    refreshCurrentPlaylist();
  }, [refreshCurrentPlaylist]);

  return (
    <Column mb="2rem">
      <Row justifyContent="space-between" mb="0">
        <Text mb="1rem" fontSize="1rem" fontWeight={600}>
          {t("components.current_playlist.title")}
        </Text>
        {currentPlaylist ? (
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
      {isLoadingCurrentPlaylist ? (
        <ItemCardSkeleton>
          <Spinner />
        </ItemCardSkeleton>
      ) : currentPlaylist ? (
        <ItemCardList>
          <ItemCard type="playlist" item={currentPlaylist} size="sm" inline />
        </ItemCardList>
      ) : (
        <ItemCardSkeleton>
          <Text color={theme.textBodyColor}>
            {t("components.current_playlist.no_current_playlist")}
          </Text>
        </ItemCardSkeleton>
      )}
    </Column>
  );
};
