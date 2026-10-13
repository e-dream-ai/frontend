import React from "react";
import { ToastRow, UndoButton } from "./archive-undo-toast.styled";

type Props = {
  name: string;
  onUndo: () => void;
};

export const ArchiveUndoToast: React.FC<Props> = ({ name, onUndo }) => (
  <ToastRow>
    <span>Archived {name}</span>
    <UndoButton type="button" onClick={onUndo}>
      Undo
    </UndoButton>
  </ToastRow>
);
