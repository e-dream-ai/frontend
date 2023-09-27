import React from "react";
import { InputError, InputGroup, InputRow } from "../input/input.styled";
import { CheckboxLabel, StyledCheckbox } from "./checkbox.styled";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

// eslint-disable-next-line react/display-name
export const Checkbox: React.FC<CheckboxProps> = React.forwardRef<
  HTMLInputElement,
  CheckboxProps
>(({ children, error, ...props }, ref) => (
  <InputGroup>
    <InputRow>
      <StyledCheckbox ref={ref} type="checkbox" {...props} />
      <CheckboxLabel>{children}</CheckboxLabel>
    </InputRow>
    {error && <InputError>{error}</InputError>}
  </InputGroup>
));

export default Checkbox;
