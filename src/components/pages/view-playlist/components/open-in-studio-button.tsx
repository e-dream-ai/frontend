import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaintBrush } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/shared";
import { useEditorProjectByPlaylist } from "@/api/editor-project/query/useEditorProjects";
import { buildStudioProjectPath } from "@/constants/routes.constants";

interface Props {
  playlistUuid: string;
  isOwner: boolean;
}

export const OpenInStudioButton: React.FC<Props> = ({
  playlistUuid,
  isOwner,
}) => {
  const navigate = useNavigate();
  const { project } = useEditorProjectByPlaylist(playlistUuid, isOwner);

  if (!isOwner || !project) return null;

  return (
    <Button
      type="button"
      mr="1rem"
      after={<FontAwesomeIcon icon={faPaintBrush} />}
      onClick={() =>
        navigate(buildStudioProjectPath(project.editorId, project.uuid))
      }
    >
      Studio
    </Button>
  );
};

export default OpenInStudioButton;
