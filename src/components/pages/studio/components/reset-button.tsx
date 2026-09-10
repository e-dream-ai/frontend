import React from "react";
import { RotateCcw } from "lucide-react";
import { ResetButton } from "./reset-button.styled";

type Props = {
  onReset: () => void;
  label: string;
};

export const StudioResetButton: React.FC<Props> = ({ onReset, label }) => (
  <ResetButton type="button" onClick={onReset} aria-label={label}>
    <RotateCcw size={11} strokeWidth={2.2} />
    Reset
  </ResetButton>
);
