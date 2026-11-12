import { useId } from "react";
import type { OptionConstraint } from "@/types/model.types";
import {
  FieldRow,
  FieldGroup,
  FieldLabel,
  FieldHint,
  Select,
} from "./transition-settings-panel.styled";

interface Props {
  constraint: OptionConstraint;
  value: string;
  onChange: (creativity: string) => void;
}

export const CreativityField = ({ constraint, value, onChange }: Props) => {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <>
      <FieldRow style={{ marginTop: 14 }}>
        <FieldGroup>
          <FieldLabel htmlFor={id}>Creativity</FieldLabel>
          <Select
            id={id}
            value={value}
            aria-describedby={hintId}
            onChange={(e) => onChange(e.target.value)}
          >
            {constraint.options.map((option) => (
              <option key={option} value={option}>
                {option === constraint.default ? `${option} (default)` : option}
              </option>
            ))}
          </Select>
        </FieldGroup>
      </FieldRow>
      <FieldHint id={hintId}>
        Creativity: lower stays close to your prompt, higher takes more
        liberties with style and mood.
      </FieldHint>
    </>
  );
};
