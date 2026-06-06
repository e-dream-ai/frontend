import React from "react";
import { InputError, InputGroup } from "../input/input.styled";
import {
  CheckboxContainer,
  CheckboxLabel,
  CheckboxRow,
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
    <CheckboxRow>
      <CheckboxContainer>
        <StyledCheckbox ref={ref} type="checkbox" {...props} />
        <span />
      </CheckboxContainer>
      <CheckboxLabel>{children}</CheckboxLabel>
    </CheckboxRow>
    {error && <InputError>{error}</InputError>}
  </InputGroup>
));

export default Checkbox;
