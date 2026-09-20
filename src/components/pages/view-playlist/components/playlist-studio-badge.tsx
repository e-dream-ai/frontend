import React from "react";
import { StudioBadge } from "@/components/shared/studio-badge";
import { useEditorProjectByPlaylist } from "@/api/editor-project/query/useEditorProjects";

interface Props {
  playlistUuid?: string;
  isOwner: boolean;
}

export const PlaylistStudioBadge: React.FC<Props> = ({
  playlistUuid,
  isOwner,
}) => {
  const { project } = useEditorProjectByPlaylist(playlistUuid, isOwner);

  if (!isOwner || !project) return null;

  return <StudioBadge mode={project.editorId} />;
};
