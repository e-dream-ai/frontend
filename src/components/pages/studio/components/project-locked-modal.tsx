import React from "react";
import { ProjectDialog } from "./project-dialog";
import { Actions, Button, Text, Title } from "./project-dialog.styled";

type Props = {
  lockedAt?: string | null;
  interrupted?: boolean;
  onTakeOver: () => void;
  onLeave: () => void;
};

const formatWhen = (iso?: string | null) => {
  if (!iso) return null;
  const opened = new Date(iso);
  if (Number.isNaN(opened.getTime())) return null;
  return opened.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ProjectLockedModal: React.FC<Props> = ({
  lockedAt,
  interrupted,
  onTakeOver,
  onLeave,
}) => {
  const when = formatWhen(lockedAt);

  return (
    <ProjectDialog labelledBy="locked-title">
      <Title id="locked-title">
        {interrupted
          ? "Playlist opened elsewhere"
          : "This playlist is already open"}
      </Title>
      <Text>
        {when
          ? `It was opened in another tab or on another device at ${when}.`
          : "It is open in another tab or on another device."}{" "}
        Editing it here takes over, and the other one stops saving.
      </Text>
      <Actions>
        <Button type="button" onClick={onLeave}>
          Back to playlists
        </Button>
        <Button type="button" $primary onClick={onTakeOver}>
          Edit here anyway
        </Button>
      </Actions>
    </ProjectDialog>
  );
};
