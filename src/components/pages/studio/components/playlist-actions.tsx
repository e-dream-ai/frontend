import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ListVideo, Play } from "lucide-react";
import useSocket from "@/hooks/useSocket";
import { emitPlayPlaylist } from "@/utils/socket.util";
import { ROUTES } from "@/constants/routes.constants";
import type { EditorProjectPlaylistRef } from "@/types/editor-project.types";
import { ActionButton, Group, SaveButton } from "./playlist-actions.styled";

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
  const navigate = useNavigate();
  const { socket } = useSocket();

  const handleOpen = useCallback(() => {
    if (playlist) navigate(`${ROUTES.VIEW_PLAYLIST}/${playlist.uuid}`);
  }, [navigate, playlist]);

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
          <ActionButton
            type="button"
            onClick={handleOpen}
            title={`Open ${playlist.name}`}
          >
            <ListVideo size={14} />
            Open
          </ActionButton>
          <ActionButton
            type="button"
            onClick={handlePlay}
            title={`Play ${playlist.name} on your client`}
          >
            <Play size={14} />
            Play
          </ActionButton>
        </>
      ) : null}
    </Group>
  );
};
