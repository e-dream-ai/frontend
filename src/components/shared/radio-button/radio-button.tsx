import { ChangeEventHandler } from "react";
import {
  RadioButtonInput,
  RadioButtonLabel,
  StyledRadioButton,
} from "./radio-button.styled";

type RadioButtonProps = {
  /**
   * Parent name
   */
  name: string;
  id: string;
  value: string;
  checked?: boolean;
  onSelect?: (value?: string) => void;
};

const RadioButton: React.FC<RadioButtonProps> = ({
  name,
  id,
  value,
  checked,
  onSelect,
}) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;
    onSelect?.(value);
  };
  return (
    <StyledRadioButton checked={checked}>
      <RadioButtonInput
        type="radio"
        name={name}
        id={id}
        value={value}
        checked={checked}
        onChange={handleChange}
      />
      <RadioButtonLabel htmlFor={id}>{id}</RadioButtonLabel>
    </StyledRadioButton>
  );
};

export default RadioButton;
