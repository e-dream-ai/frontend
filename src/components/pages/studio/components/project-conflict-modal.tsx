import React from "react";
import { ProjectDialog } from "./project-dialog";
import { Actions, Button, Text, Title } from "./project-dialog.styled";

type Props = {
  serverName?: string;
  onTakeTheirs: () => void;
  onOverwrite: () => void;
  onKeepMine: () => void;
};

export const ProjectConflictModal: React.FC<Props> = ({
  serverName,
  onTakeTheirs,
  onOverwrite,
  onKeepMine,
}) => (
  <ProjectDialog labelledBy="conflict-title">
    <Title id="conflict-title">This project changed somewhere else</Title>
    <Text>
      {serverName ? `"${serverName}"` : "This project"} was saved in another tab
      or on another device after you opened it. Pick which version to keep.
    </Text>
    <Actions>
      <Button type="button" onClick={onTakeTheirs}>
        Load the other version
      </Button>
      <Button type="button" onClick={onKeepMine}>
        Save mine as a copy
      </Button>
      <Button type="button" $primary onClick={onOverwrite}>
        Overwrite with mine
      </Button>
    </Actions>
  </ProjectDialog>
);
