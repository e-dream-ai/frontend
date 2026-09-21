import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaintBrush } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/shared";
import { buildStudioProjectPath } from "@/constants/routes.constants";
import type { EditorProjectSummary } from "@/types/editor-project.types";

type Props = {
  project?: EditorProjectSummary;
};

export const OpenInStudio: React.FC<Props> = ({ project }) => {
  const navigate = useNavigate();

  const handleOpen = useCallback(() => {
    if (project) {
      navigate(buildStudioProjectPath(project.editorId, project.uuid));
    }
  }, [navigate, project]);

  if (!project) return null;

  return (
    <Button
      type="button"
      mr="1rem"
      after={<FontAwesomeIcon icon={faPaintBrush} />}
      onClick={handleOpen}
    >
      Open in Studio
    </Button>
  );
};
