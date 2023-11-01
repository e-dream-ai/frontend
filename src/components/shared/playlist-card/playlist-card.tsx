import Text from "components/shared/text/text";
import { FORMAT } from "constants/moment.constants";
import { ROUTES } from "constants/routes.constants";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Playlist } from "types/playlist.types";
import Anchor from "../anchor/anchor";
import {
  PlaylistCardBody,
  PlaylistCardImage,
  StyledPlaylistCard,
  ThumbnailPlaceholder,
} from "./playlist-card.styled";

type PlaylistCardProps = {
  playlist: Playlist;
};

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => {
  const { id, name, thumbnail, created_at, user } = playlist;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const navigateToPlaylist = (id: number) => () =>
    navigate(`${ROUTES.PLAYLIST}/${id}`);

  return (
    <StyledPlaylistCard onClick={navigateToPlaylist(id)}>
      {thumbnail ? (
        <PlaylistCardImage src={thumbnail} />
      ) : (
        <ThumbnailPlaceholder>
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
  return <ul>{children}</ul>;
};
