import React from "react";
import { InputError, InputGroup, InputRow } from "../input/input.styled";
import {
  CheckboxContainer,
  CheckboxLabel,
  StyledCheckbox,
} from "./checkbox.styled";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export const Checkbox: React.FC<CheckboxProps> = React.forwardRef<
  HTMLInputElement,
  CheckboxProps
>(({ children, error, ...props }, ref) => (
  <InputGroup>
    <InputRow>
      <CheckboxContainer>
        <StyledCheckbox ref={ref} type="checkbox" {...props} />
        <span />
      </CheckboxContainer>
      <CheckboxLabel>{children}</CheckboxLabel>
    </InputRow>
    {error && <InputError>{error}</InputError>}
  </InputGroup>
));

export default Checkbox;
