import Text from "components/shared/text/text";
import { DRAG_DROP_FORMAT } from "constants/dnd.constants";
import { FORMAT } from "constants/moment.constants";
import { ROUTES } from "constants/routes.constants";
import moment from "moment";
import { MouseEventHandler, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Playlist } from "types/playlist.types";
import { Sizes } from "types/sizes.types";
import Anchor from "../anchor/anchor";
import { Button } from "../button/button";
import {
  MediaItemCardBody,
  MediaItemCardImage,
  StyledMediaItemCard,
  StyledMediaItemCardList,
  ThumbnailPlaceholder,
} from "../media-item-card/media-item-card";
import Row from "../row/row";

type PlaylistCardProps = {
  playlist: Playlist;
  size?: Sizes;
  onDelete?: MouseEventHandler<HTMLButtonElement>;
};

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  size = "md",
  onDelete,
}) => {
  const cardRef = useRef<HTMLLIElement>(null);
  const { id, name, thumbnail, created_at, user } = playlist;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const navigateToPlaylist = (id: number) => () =>
    navigate(`${ROUTES.PLAYLIST}/${id}`);

  const handleDragStart = useCallback(
    (event: DragEvent) => {
      event?.dataTransfer?.setData(
        DRAG_DROP_FORMAT.TYPE,
        DRAG_DROP_FORMAT.PLAYLIST,
      );
      event?.dataTransfer?.setData(DRAG_DROP_FORMAT.ID, String(playlist.id));
      return true;
    },
    [playlist.id],
  );

  const registerEvents = useCallback(() => {
    cardRef.current?.addEventListener("dragstart", handleDragStart);
  }, [cardRef, handleDragStart]);

  const unregisterEvents = useCallback(() => {
    cardRef.current?.removeEventListener("dragstart", handleDragStart);
  }, [cardRef, handleDragStart]);

  useEffect(() => {
    registerEvents();

    return () => unregisterEvents();
  }, [registerEvents, unregisterEvents]);

  return (
    <StyledMediaItemCard
      ref={cardRef}
      draggable="true"
      onClick={navigateToPlaylist(id)}
    >
      {thumbnail ? (
        <MediaItemCardImage size={size} draggable="false" src={thumbnail} />
      ) : (
        <ThumbnailPlaceholder size={size}>
          <i className="fa fa-picture-o" />
        </ThumbnailPlaceholder>
      )}
      <MediaItemCardBody>
        <Anchor type="secondary" onClick={navigateToPlaylist(id)}>
          {name || "Unnamed Playlist"}
        </Anchor>
        <Text>
          {t("components.playlist_card.videos")}: {playlist.itemCount ?? 0}
        </Text>
        <Text>
          {t("components.playlist_card.created_at")}:{" "}
          {moment(created_at).format(FORMAT)}
        </Text>
        <Text>
          {t("components.playlist_card.owner")}: {user?.email}
        </Text>
      </MediaItemCardBody>
      {onDelete && (
        <Row justifyContent="flex-end" ml={1}>
          <Button type="button" onClick={onDelete}>
            <i className="fa fa-trash" />
          </Button>
        </Row>
      )}
    </StyledMediaItemCard>
  );
};

export const PlaylistCardList: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <StyledMediaItemCardList>{children}</StyledMediaItemCardList>;
};
