import React, { useCallback, useState } from "react";
import { ProjectDialog } from "./project-dialog";
import { Actions, Button, Text, Title } from "./project-dialog.styled";
import { NameField } from "./playlist-name-modal.styled";

type Props = {
  defaultName: () => string;
  onSave: (name: string) => void;
  onCancel: () => void;
};

export const PlaylistNameModal: React.FC<Props> = ({
  defaultName,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(defaultName);
  const trimmed = name.trim();

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (trimmed) onSave(trimmed);
    },
    [onSave, trimmed],
  );

  return (
    <ProjectDialog labelledBy="playlist-name-title">
      <form onSubmit={handleSubmit}>
        <Title id="playlist-name-title">Name this playlist</Title>
        <Text>
          Saving creates a playlist. Everything you render here goes into it.
        </Text>
        <NameField
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Playlist name"
          aria-label="Playlist name"
          maxLength={120}
          autoFocus
        />
        <Actions>
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" $primary disabled={!trimmed}>
            Save
          </Button>
        </Actions>
      </form>
    </ProjectDialog>
  );
};
