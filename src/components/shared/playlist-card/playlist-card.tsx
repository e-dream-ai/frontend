import Text from "components/shared/text/text";
import { DRAG_DROP_FORMAT } from "constants/dnd.constants";
import { FORMAT } from "constants/moment.constants";
import { ROUTES } from "constants/routes.constants";
import moment from "moment";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Playlist } from "types/playlist.types";
import { Sizes } from "types/sizes.types";
import Anchor from "../anchor/anchor";
import {
  PlaylistCardBody,
  PlaylistCardImage,
  StyledPlaylistCard,
  StyledPlaylistCardList,
  ThumbnailPlaceholder,
} from "./playlist-card.styled";

type PlaylistCardProps = {
  playlist: Playlist;
  size?: Sizes;
};

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  size = "md",
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
    <StyledPlaylistCard
      ref={cardRef}
      draggable="true"
      onClick={navigateToPlaylist(id)}
    >
      {thumbnail ? (
        <PlaylistCardImage size={size} draggable="false" src={thumbnail} />
      ) : (
        <ThumbnailPlaceholder size={size}>
          <i className="fa fa-picture-o" />
        </ThumbnailPlaceholder>
      )}
      <PlaylistCardBody>
        <Anchor type="secondary" onClick={navigateToPlaylist(id)}>
          {name || "Unnamed Playlist"}
        </Anchor>
        <Text>{t("components.playlist_card.videos")}: 0</Text>
        <Text>
          {t("components.playlist_card.created_at")}:{" "}
          {moment(created_at).format(FORMAT)}
        </Text>
        <Text>
          {t("components.playlist_card.owner")}: {user?.email}
        </Text>
      </PlaylistCardBody>
    </StyledPlaylistCard>
  );
};

export const PlaylistCardList: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <StyledPlaylistCardList>{children}</StyledPlaylistCardList>;
};
