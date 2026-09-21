import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListUl } from "@fortawesome/free-solid-svg-icons";
import useSocket from "@/hooks/useSocket";
import usePlaybackClient from "@/hooks/usePlaybackClient";
import PlaylistPlay from "@/icons/playlist-play";
import { emitPlayPlaylist } from "@/utils/socket.util";
import { ROUTES } from "@/constants/routes.constants";
import type { EditorProjectPlaylistRef } from "@/types/editor-project.types";
import {
  ActionButton,
  ActionLink,
  Group,
  SaveButton,
} from "./playlist-actions.styled";

type Props = {
  playlist: EditorProjectPlaylistRef | null;
  canSave: boolean;
  saving: boolean;
  onSave: () => void;
};

export const PlaylistActions: React.FC<Props> = ({
  playlist,
  canSave,
  saving,
  onSave,
}) => {
  const { socket } = useSocket();
  const hasPlaybackClient = usePlaybackClient();

  const handlePlay = useCallback(() => {
    if (playlist) emitPlayPlaylist(socket, playlist);
  }, [playlist, socket]);

  return (
    <Group>
      {canSave ? (
        <SaveButton type="button" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </SaveButton>
      ) : null}

      {playlist ? (
        <>
          <ActionLink
            to={`${ROUTES.VIEW_PLAYLIST}/${playlist.uuid}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`Open ${playlist.name} in a new tab`}
          >
            <FontAwesomeIcon icon={faListUl} />
            Open
          </ActionLink>
          <ActionButton
            type="button"
            onClick={handlePlay}
            disabled={!hasPlaybackClient}
            title={
              hasPlaybackClient
                ? `Play ${playlist.name} on your client`
                : "No client connected"
            }
          >
            <PlaylistPlay width="1.7em" height="1em" />
            Play
          </ActionButton>
        </>
      ) : null}
    </Group>
  );
};
